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
