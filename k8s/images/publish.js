const { spawn, exec } = require('child_process');
const { program } = require('commander');

program
    .option('-h, --help', 'Display help message')
    .option('-n, --nerdctl', 'Use nerdctl cli instead of docker cli')
    .parse();

const options = program.opts();

if (options.help) {
    program.outputHelp();
    process.exit(0);
}

const cli = options.nerdctl ? 'nerdctl' : 'docker';

function executeCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { stdio: 'inherit' });

        process.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(`Command '${command}' failed with exit code ${code}`);
            }
        });
    });
}

function getGitCommitHash() {
    return new Promise((resolve, reject) => {
        exec('git rev-parse HEAD', (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

async function buildImage(app) {
    const username = 'pnxedudevops';
    const repository = 'apps';
    const gitSHA = await getGitCommitHash();
    const contextPath = `${__dirname}/../../src/${app}/devops-app`;
    const latestTag = `${app}-latest`;
    const gitCommitTag = `${app}-${gitSHA}`
    const latestImageName = `${username}/${repository}:${latestTag}`;
    const commitImageName = `${username}/${repository}:${gitCommitTag}`;

    try {
        console.log(`Running: ${cli} build -t ${latestImageName} -t ${commitImageName} ${contextPath}`);
        await executeCommand(cli, ['build', '-t', `${latestImageName}`, '-t', `${commitImageName}`, contextPath]);
        console.log('Docker build successful.');

        console.log(`Logging in to docker hub`);
        await executeCommand(cli, ['login']);

        console.log(`Running: ${cli} push ${latestImageName}`);
        await executeCommand(cli, ['push', `${latestImageName}`]);
        console.log('Docker push successful.');

        console.log(`Running: ${cli} push ${latestImageName}`);
        await executeCommand(cli, ['push', `${commitImageName}`]);
        console.log('Docker push successful.');
    } catch (error) {
        console.error(error);
    }
}

async function main() {
    await buildImage('frontend');
    await buildImage('backend');
}

main();