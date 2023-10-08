# This file contains possible issues you may encouter during setting up the project.

### FRONTEND
## devops-app
# Issue: Starting web server -> listen EACCES: permission denied 127.0.0.1:5173
- Open PowerShell as Admin
- stop winnat with command: net stop winnat
- start winnat again with command: net start winnat
(reference https://stackoverflow.com/a/64261432)