# Tools to install

* git

## Personal local env setup

### MKoplinger

* IDE: VS Code
  * extensions:
    * GitHub Pull Request and Issue (GitHub.vscode-pull-request-github)
    * GitLens (eamodio.gitlens)
    * Remote - SSH (ms-vscode-remote.remote-ssh)
    * Code Spell Checker (streetsidesoftware.code-spell-checker)
    * markdownlint (DavidAnson.vscode-markdownlint)
    * YAML (redhat.vscode-yaml)
    * Vue Language Features - Volar (Vue.volar) + [Take Over Mode](<https://vuejs.org/guide/typescript/overview.html#volar-takeover-mode>)
    * ESlint (dbaeumer.vscode-eslint)
    * Prettier ESLint (rvest.vs-code-prettier-eslint)
    * Go (golang.go)
    * TODO Highlight (wayou.vscode-todo-highlight)
    * vscode-helm
* Terminal: powershell 7
  * kubectl extensions: kubectx, kubens
  * VS Code config

    ```json
        "terminal.integrated.profiles.windows": {
            "PowerShell_7": {
            "path": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
            "icon": "terminal-powershell"
            }
        },
        
        // Make the profile defined above the default profile.
        "terminal.integrated.defaultProfile.windows": "PowerShell_7" 
    ```

  * posh-git (module that integrates Git and PowerShell)

    ```sh
    $GitPromptSettings.EnableFileStatus = $false
    $GitPromptSettings.DefaultPromptAbbreviateHomeDirectory = $true
    $GitPromptSettings.DefaultPromptWriteStatusFirst = $true
    ```

* WSL
  * openssh server (wsl)
  * update hosts file (windows)
  * setup password-less ssh with public/private keys
* Kubernetes: Rancher desktop + containerd with nerdctl
* Node.js
* Go
* Helm CLI

  ```sh
  choco install kubernetes-helm
  ```

* Download Argo CD CLI - Linux (optional)

  Download latest stable version

  ```sh
  VERSION=$(curl -L -s https://raw.githubusercontent.com/argoproj/argo-cd/stable/VERSION)
  curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/download/v$VERSION/argocd-linux-amd64
  sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
  rm argocd-linux-amd64
  ```

* kubeseal CLI
  * run ./scripts/kubeseal-windows-installer/Install-Kubeseal.ps1
