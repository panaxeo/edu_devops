# README

1. Deploy the argo-cd

    ```sh
    kubectl apply -k ./k8s/apps/argo-cd/overlays/dev
    ```

2. Deploy the sealed-secrets app

    ```sh
    kubectl apply -f ./k8s/app-of-apps-chart/templates/sealed-secrets.yaml
    ```

3. Create your own configuration in ./k8s/deploy-conf.yaml e.g.

    ```yaml
    envs:
    - name: dev-jkukuricudus
      targetRevision: dev-jkukuricudus
    ```

4. Wait until all pods for argocd and sealed-secrets are in running state

    ```sh
        kubectl get pods -A --watch
    ```

5. Create deployment branch by running (for more info run "node deploy.js --help")

    ```sh
        cd ./scripts
        npm install
        node deploy.js
    ```

    - select number of your new env (defined in deploy-conf.yaml)
    - provide dockerhub credentials (regcred secret for login to docker hub)
    - provide gitea credentials (gitcred secret for login to gitea)
    - on prompt "Do you want to push the changes" response "y"

6. Update ./k8s/app-of-apps.yaml with targetRevision value from deploy-conf.yaml and apply it

    ```sh
        # cd to project dir
        kubectl apply -f ./k8s/app-of-apps.yaml
    ```

7. Wait until all pods are in running state

    ```sh
        kubectl get pods -A --watch
    ```

8. Check if everything is working (devops-app will not work yet):
    - add hostnames to C:\Windows\System32\drivers\etc

    ```text
    <node IP> cluster.traefik.local
    <node IP> cluster.argocd.local
    <node IP> cluster.argowf.local
    <node IP> cluster.dev.local
    <node IP> cluster.gitea.local
    <node IP> cluster.grafana.local
    ```

    - now you can visit following URLs:
        - <http://cluster.traefik.local:8081> (state of cluster networking)
        - <http://cluster.argocd.local:8081> (state of applications)
            - username: admin
            - password: kubectl get secret -n argocd argocd-initial-admin-secret -o yaml
                - then decode the password:
                    - linux: echo {{PASSWORD}} | base64 -d
                    - js console: atob({{PASSWORD}})
        - <http://cluster.argowf.local:8081> (state of pipelines)
        - <http://cluster.gitea.local:8081> (gitea version control provider)
            - username: gitea
            - password: provided to deploy.js script as gitcred secret
        - <http://cluster.grafana.local:8081> (logs/monitoring)
            - username: admin
            - password: kubectl get secret -n monitoring grafana -o yaml
                - then decode the password:
                    - linux: echo {{PASSWORD}} | base64 -d
                    - js console: atob({{PASSWORD}})

9. Create gitea repositories (<http://cluster.gitea.local:8081>)
    - create frontend-devops-app repo
    - create backend-devops-app repo
    - create k8s repo

10. Copy and push code to new gitea repositories:
    - copy all files from ./src/frontend/* (do not copy node_modules or dist) to frontend-devops-app repo
    - copy all files from ./src/backend/* to backend-devops-app repo
    - copy all files from ./k8s/dist/apps/devops-app/* to k8s repo
    - push changes in both repos

11. Check if frontend and backend apps were deployed
    - deployment status -> argo-cd ui <http://cluster.argocd.local:8081> (username and password from step number 9)
    - <http://cluster.dev.local:8081/frontend> (our frontend app)
    - <http://cluster.dev.local:8081/backend> (our backend app)

12. Create webhook
    - frontend-devops-app repo
        - URL: <http://webhook-eventsource.ci:12000/frontend-push>
        - HTTP Mehtod: POST
        - ContentType: application/json
    - backend-devops-app repo
        - URL: <http://webhook-eventsource.ci:12000/backend-push>
        - HTTP Mehtod: POST
        - ContentType: application/json

13. Try pipeline by pushing new changes to frontend-devops-app and backend-devops-app repos. It should run the pipelines and deploy new versions of applications.
    - you can see pipeline progress on argo-workflows ui <http://cluster.argowf.local:8081>

14. Check if new versions were deployed
    - <http://cluster.dev.local:8081/frontend>
    - <http://cluster.dev.local:8081/backend>

15. (Recommended) Push your new configuration (./k8s/deploy-conf.yaml) to main

16. (Optional) Create your own overlays to overwrite default
    - e.g. k8s/apps/traefik/overlays/dev-mkoplinger
    - then update k8s/deploy-conf.yaml e.g.

    ```yaml
    - name: dev-mkoplinger
      targetRevision: dev-mkoplinger
      apps:
        traefik:
          overlay: dev-mkoplinger
    ```

17. (Optional) Create your own values files to overwrite default
    - e.g. k8s/apps/gitea/values-dev-mkoplinger.yaml
    - then update k8s/deploy-conf.yaml e.g.

    ```yaml
    - name: dev-mkoplinger
      targetRevision: dev-test
      apps:
        gitea:
          helmValues:
          - dev-mkoplinger
    ```

18. (Optional) For new changes deploy run

    ```sh
        cd ./scripts
        npm install
        node deploy.js -k # -k for keep-secrets
    ```
