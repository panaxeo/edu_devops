const fs = require('fs');
const path = require('path');
const readline = require('readline');
const readlineSync = require('readline-sync');
const { execSync, spawn } = require('child_process');
const yaml = require('js-yaml');
const { program } = require('commander');

// Define paths
const sourceDir = path.join(__dirname, '../k8s/dist');
const targetDir = path.join(__dirname, '../../dist');
const gitOrigin = 'https://github.com/panaxeo/edu_devops.git';

// Set up command-line options
program
    .option('-d, --diff', 'Show git diff for changed files')
    .option('-v, --verbose', 'Provide detailed output')
    .option('-y, --yes', 'Automatically push changes without confirmation')
    .option('-k, --keep-secrets', 'Keep secrets from the previous dist folder before it is deleted')
    .parse();

const options = program.opts();

// Function to remove all contents of a directory
function removeDirectoryContents(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            const currentPath = path.join(dir, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                fs.rmSync(currentPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(currentPath);
            }
        });
    }
}

// Function to merge values from deploy-conf.yaml based on selected environment parts
function mergeValuesFromDeployConfig(envParts) {
    const configFilePath = path.join(__dirname, '../k8s/deploy-conf.yaml');
    
    // Load YAML file content
    const configContent = yaml.load(fs.readFileSync(configFilePath, 'utf8'));

    let mergedValues = {
        targetRevision: '',  // Initialize targetRevision to be progressively set
        apps: {}
    };

    // Merge progressively by env parts (from more general to more specific)
    envParts.forEach(envPart => {
        const envConfig = configContent.envs.find(env => env.name === envPart);

        if (envConfig) {
            // Update the targetRevision (most specific env part takes precedence)
            mergedValues.targetRevision = envConfig.targetRevision || mergedValues.targetRevision;
            
            // Merge the apps configuration and targetRevision
            mergedValues.apps = { ...mergedValues.apps, ...envConfig.apps };
        }
    });

    // Return the final merged values object
    return mergedValues;
}


// Function to create the folder structure based on user selection and deploy-conf.yaml values
async function createFolderStructure(mergedValues) {
    const sourceDir = path.join(__dirname, '../k8s');
    const distDir = path.join(sourceDir, 'dist');
    const chartDir = path.join(sourceDir, 'app-of-apps-chart');
    const secrets = readSecretsConfig();
    const sealedSecrets = {};

    if (options.keepSecrets)
    {
        for (const secret of secrets) {
            const { name, apps } = secret;
            sealedSecrets[name] = {};

            for (const app of apps) {
                sealedSecrets[name][app] = await readSealedSecret(app, name);
            }
        }
    }

    // Remove and recreate dist directory
    if (fs.existsSync(distDir)) {
        removeDirectoryContents(distDir);
    } else {
        fs.mkdirSync(distDir);
    }

    copyDirectoryRecursive(chartDir, path.join(distDir, 'app-of-apps-chart'));

    // Process app-of-apps chart based on merged values
    processAppOfAppsChart(mergedValues, distDir);

    if (options.keepSecrets) {
        for (const secret of secrets) {
            const { name, apps } = secret;
            for (const app of apps) {
                saveSealedSecret(app, name, sealedSecrets[name][app]);
            }
        }
    } else {
        await handleSecrets(secrets);
    }

    // Copy the merged values.yaml to dist/app-of-apps-chart
    const distValuesFilePath = path.join(distDir, 'app-of-apps-chart', 'values.yaml');
    fs.mkdirSync(path.dirname(distValuesFilePath), { recursive: true });  // Ensure directory exists
    fs.writeFileSync(distValuesFilePath, yaml.dump(mergedValues));

    if (options.verbose) {
        console.log(`Copied merged values.yaml to ${distValuesFilePath}`);
    }
}

function constructEnvMap() {
    const configFilePath = path.join(__dirname, '../k8s/deploy-conf.yaml');
    
    // Load YAML file content
    const configContent = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
    
    // Initialize an empty envMap
    const envMap = {};
    
    // Check if `envs` exists in the YAML structure
    if (configContent.envs && Array.isArray(configContent.envs)) {
        configContent.envs.forEach((env, index) => {
            envMap[index + 1] = env.name;  // Add environment name to envMap with a corresponding index
        });
    } else {
        console.error('No valid envs found in deploy-conf.yaml');
    }

    return envMap;
}

// Function to prompt user for environment selection
function promptForEnv(envMap) {
    console.log('Available Environments:');
    for (const [key, value] of Object.entries(envMap)) {
        console.log(`${key}: ${value}`);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Please select an environment by entering the number: ', (answer) => {
            const selectedEnv = envMap[parseInt(answer)];
            rl.close();
            resolve(selectedEnv);
        });
    });
}

// Function to process the app-of-apps-chart and handle overlays/Helm charts
function processAppOfAppsChart(mergedValues, distDir) {
    const appsDir = path.join(__dirname, '../k8s/apps');
    const distAppDir = path.join(distDir, 'apps');
    const apps = mergedValues.apps;
    
    Object.keys(apps).forEach(appNameCamelCase => {
        const appConfig = apps[appNameCamelCase];
        const appName = appNameCamelCase.replace(/[A-Z]/g, match => '-' + match.toLowerCase()).replace(/^-/, '');

        const appPath = path.join(appsDir, appName);
        const distAppPath = path.join(distAppDir, appName);
        fs.mkdirSync(distAppPath, { recursive: true });

        const basePath = path.join(appPath, 'base');
        if (fs.existsSync(basePath)) {
            const distBasePath = path.join(distAppPath, 'base');
            copyDirectoryRecursive(basePath, distBasePath);
            if (options.verbose) {
                console.log(`[${appName}]: Copied base overlay`);
            }
        }

        if (appConfig.overlay) {
            const overlays = appConfig.overlay.split('-').map((part, index, arr) => arr.slice(0, index + 1).join('-'));
            overlays.forEach(overlay => {
                const overlaySrcPath = path.join(appPath, 'overlays', overlay);
                const distOverlayPath = path.join(distAppPath, 'overlays', overlay);
                if (fs.existsSync(overlaySrcPath)) {
                    copyDirectoryRecursive(overlaySrcPath, distOverlayPath);
                    if (options.verbose) {
                        console.log(`[${appName}]: Copied overlay - ${overlay}`);
                    }
                }
            });
        }

        if (appConfig.helmValues) {
            copyHelmChartAndSelectedValues(appPath, distAppPath, appConfig.helmValues, appName);
        }
    });
}

// Function to recursively copy Helm charts and selected values
function copyHelmChartAndSelectedValues(src, dest, helmValues, app) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    fs.readdirSync(src).forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);

        if (file === 'values.yaml' || helmValues.some(valueFile => file === `values-${valueFile}.yaml`)) {
            fs.copyFileSync(srcFile, destFile);
            if (options.verbose) {
                console.log(`[${app}]: Copied values - ${file}`);
            }
        } else if (!file.startsWith('values')) {
            if (fs.lstatSync(srcFile).isDirectory()) {
                copyHelmChartAndSelectedValues(srcFile, destFile, helmValues, app);
            } else {
                fs.copyFileSync(srcFile, destFile);
            }
        }
    });
}

// Utility function to recursively copy a directory
function copyDirectoryRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    fs.readdirSync(src).forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);

        if (fs.lstatSync(srcFile).isDirectory()) {
            copyDirectoryRecursive(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}

// Function to remove all contents of a directory except for the .git folder
function removeDirectoryContentsExceptGit(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            const currentPath = path.join(dir, file);
            if (file !== '.git') {
                if (fs.lstatSync(currentPath).isDirectory()) {
                    fs.rmSync(currentPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(currentPath);
                }
            }
        });
        if (options.verbose) {
            console.log(`Cleared contents of ${dir} except for .git folder`);
        }
    }
}

// Function to initialize a Git repository if it doesn't already exist
function initGitRepo(repoDir, origin, branch) {
    try {
        if (!fs.existsSync(path.join(repoDir, '.git'))) {
            execSync('git init', { cwd: repoDir });
            execSync(`git remote add origin ${origin}`, { cwd: repoDir });
            if (options.verbose) {
                console.log('Initialized a new Git repository');
                console.log(`Set remote origin to: ${origin}`);
            }
        } else {
            if (options.verbose) {
                console.log('Git repository already exists, skipping initialization.');
            }
        }
        execSync(`git checkout -B ${branch}`, { cwd: repoDir });
        console.log(`Checked out branch: ${branch}`);
    } catch (error) {
        console.error('Error during Git operations:', error);
    }
}

// Function to show git diff and list changes
function showChanges(repoDir) {
    try {
        const status = execSync('git status --short', { cwd: repoDir }).toString();
        if (status) {
            console.log('Changes to be committed:');
            console.log(status);
            if (options.diff) {
                const stagedDiff = execSync('git diff --cached --color --diff-filter=M', { cwd: repoDir }).toString();
                console.log('Staged changes (ready to commit):');
                console.log(stagedDiff);
            }
        } else {
            console.log('No changes detected.');
        }
        return status; 
    } catch (error) {
        console.error('Error showing git changes:', error);
        return '';
    }
}

// Function to commit and force push changes
function commitAndPush(repoDir, branch) {
    try {
        execSync('git add .', { cwd: repoDir });
        const changes = showChanges(repoDir);
        if (!changes) {
            console.log('No changes to push.');
            return;
        }

        if (options.yes || readlineSync.question('Do you want to push the changes? (y/n): ').toLowerCase() === 'y') {
            execSync('git commit -m "Updated dist files"', { cwd: repoDir });
            execSync(`git push origin ${branch} --force`, { cwd: repoDir });
            console.log(`Pushed changes to branch: ${branch}`);
        } else {
            console.log('Changes not pushed.');
        }
    } catch (error) {
        console.error('Error during commit/push:', error);
    }
}

// Function to read secrets from deploy-conf.yaml
function readSecretsConfig() {
    const configPath = path.join(__dirname, '../k8s/deploy-conf.yaml');
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return config.secrets || [];
}

// Function to create a docker-registry secret using dynamic properties
async function createDockerRegistrySecret(secretName, namespace, password, dockerConfig) {
    const { server, username, email } = dockerConfig;
    const command = `kubectl create secret docker-registry ${secretName} -n ${namespace} \
--docker-server=${server} \
--docker-username=${username} \
--docker-password=${password} \
--docker-email=${email} \
-o yaml --dry-run=client | kubeseal --format yaml \
--controller-namespace kubeseal --controller-name sealed-secrets`;

    const sealedSecret = await runCommand(command);
    await saveSealedSecret(namespace, secretName, sealedSecret);  // Save the generated secret
}

// Function to create a generic secret using dynamic properties from literals
async function createGenericSecret(secretName, namespace, literals) {
    const literalArgs = literals.map(literal => `--from-literal=${literal.key}=${literal.value}`).join(' ');
    const command = `kubectl create secret generic ${secretName} -n ${namespace} ${literalArgs} \
-o yaml --dry-run=client | kubeseal --format yaml \
--controller-namespace kubeseal --controller-name sealed-secrets`;

    const sealedSecret = await runCommand(command);
    await saveSealedSecret(namespace, secretName, sealedSecret);  // Save the generated secret
}

// Function to run commands with input piped from stdin
function runCommandWithInput(command, input, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args);

        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            reject(data.toString());
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(`Command exited with code ${code}`);
            }
        });

        // Write input to stdin of the command
        child.stdin.write(input);
        child.stdin.end();
    });
}

// Function to retrieve and seal an existing secret (for ArgoCD) without using a temp file
async function retrieveAndSealSecret(secretName, oldNamespace, newNamespace) {
    // Get the secret YAML directly from the kubectl command and load it into memory
    const commandGet = `kubectl get secret -n ${oldNamespace} ${secretName} -o yaml`;
    const secretYamlOutput = await runCommand(commandGet);

    // Parse the YAML, modify the namespace, and convert it back to YAML format
    const secretYaml = yaml.load(secretYamlOutput);
    secretYaml.metadata.namespace = newNamespace; // Update the namespace

    // Convert the updated secret YAML to a string
    const secretYamlString = yaml.dump(secretYaml);

    // Pass the modified YAML to kubeseal via stdin using the spawn method
    const sealedSecret = await runCommandWithInput(
        'kubeseal',
        secretYamlString,
        ['--format', 'yaml', '--controller-namespace', 'kubeseal', '--controller-name', 'sealed-secrets']
    );

    // Save the sealed secret
    await saveSealedSecret(newNamespace, secretName, sealedSecret);  // Save the generated secret
}

// Function to save the sealed secret to the correct path
async function saveSealedSecret(namespace, secretName, sealedSecret) {
    let distDir = path.join(__dirname, `../k8s/dist/apps/${namespace}`);
    const appDir = path.join(__dirname, `../k8s/apps/${namespace}`);
    const folderType = checkFolderType(appDir);

    if (folderType.isHelmFolder) {
        distDir = path.join(distDir, 'templates');
    } else if (folderType.isKustomizeFolder) {
        distDir = path.join(distDir, 'base');
    } else {
        return;
    }

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    const filePath = path.join(distDir, `${secretName}.yaml`);

    fs.writeFileSync(filePath, sealedSecret);
    console.log(`Saved sealed secret to ${filePath}`);
}

// Function to save the sealed secret to the correct path
async function readSealedSecret(namespace, secretName) {
    let distDir = path.join(__dirname, `../k8s/dist/apps/${namespace}`);
    const folderType = checkFolderType(distDir);

    if (folderType.isHelmFolder) {
        distDir = path.join(distDir, 'templates');
    } else if (folderType.isKustomizeFolder) {
        distDir = path.join(distDir, 'base');
    }

    const filePath = path.join(distDir, `${secretName}.yaml`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`Option --keep-secrets is set and ${filePath} does not exist.`);
        process.exit(1);
    }

    return fs.readFileSync(filePath, 'utf8');
}


async function handleSecrets(secrets) {
    for (const secret of secrets) {
        const { name, type, apps, docker, secretNamespaceRef, literals } = secret;

        if (type === 'docker-registry') {
            const password = await promptForPassword(name, apps.join(', '));
            for (const app of apps) {
                await createDockerRegistrySecret(name, app, password, docker);
            }
        } else if (type === 'generic') {
            for (const literal of literals)
            {
                if (!literal.value)
                    literal.value = await promptForPassword(name, apps.join(', '));
            }

            for (const app of apps) {
                await createGenericSecret(name, app, literals);
            }
        } else if (secretNamespaceRef) {
            for (const app of apps) {
                await retrieveAndSealSecret(name, secretNamespaceRef, app);
            }
        }
    }
}

function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8' });
    } catch (error) {
        console.error(`Error running command: ${command}`);
        return null;
    }
}


function promptForPassword(secretName, namespace) {
    return readlineSync.question(`Enter password for ${secretName} in ${namespace} namespace: `, {
        hideEchoBack: true
    });
}

function checkFolderType(folderPath) {
    const helmTemplatePath = path.join(folderPath, 'templates');
    const kustomizeBasePath = path.join(folderPath, 'base');
    const kustomizeOverlaysPath = path.join(folderPath, 'overlays');

    if (fs.existsSync(helmTemplatePath) && fs.lstatSync(helmTemplatePath).isDirectory()) {
        return { isHelmFolder: true, isKustomizeFolder: false };
    } else if (fs.existsSync(kustomizeBasePath) && fs.existsSync(kustomizeOverlaysPath) &&
        fs.lstatSync(kustomizeBasePath).isDirectory() && fs.lstatSync(kustomizeOverlaysPath).isDirectory()) {
        return { isHelmFolder: false, isKustomizeFolder: true };
    }

    return { isHelmFolder: false, isKustomizeFolder: false };
}

// Main function to create dist folder and manage Git operations
async function main() {
    const envMap = constructEnvMap();

    if (Object.keys(envMap).length === 0) {
        console.error('No environment values files found!');
        process.exit(1);
    }

    const selectedEnv = await promptForEnv(envMap);
    if (!selectedEnv) {
        console.error('Invalid selection!');
        process.exit(1);
    }
    console.log(`Selected environment: ${selectedEnv}`);

    const envParts = selectedEnv.split('-').map((part, index, arr) => arr.slice(0, index + 1).join('-'));
    const mergedValues = mergeValuesFromDeployConfig(envParts);
    const gitBranch = mergedValues.targetRevision

    await createFolderStructure(mergedValues);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
        initGitRepo(targetDir, gitOrigin, gitBranch);
    } else {
        initGitRepo(targetDir, gitOrigin, gitBranch);
    }

    removeDirectoryContentsExceptGit(targetDir);
    copyDirectoryRecursive(sourceDir, targetDir);
    if (options.verbose) {
        console.log(`Copied ${sourceDir} to ${targetDir}`);
    }
    commitAndPush(targetDir, gitBranch);
}

main();
