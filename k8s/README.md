# README

1. Create new git branch (from main) e.g. dev-jozko-kukuricudus and checkout into it (you can also check branch dev-mkoplinger as an example)

2. Deploy the argo-cd app

    ```sh
    kubectl apply -k ./k8s/apps/argo-cd/overlays/dev
    ```

3. Create your own values file in ./k8s/app-of-apps-chart e.g. values-dev-jozko-kukuricudus.yaml and push changes

    ```yaml
    targetRevision: {{YOUR_NEW_BRANCH}}
    ```

4. Update ./k8s/app-of-apps.yaml with new git branch (replace targetRevision) and add new item under helm->valueFiles-> e.g. values-dev-jozko-kukuricudus.yaml

5. Generate sealed secrets
    - regcred.yaml in devops-app namespace (registry credentials)
    - regcred.yaml in ci namespace (registry credentials)

    ```sh
    (LINUX)
    (important! single quotes around password are required if there are special characters)

    kubectl create secret docker-registry regcred -n {{NAMESPACE}} --docker-server=https://index.docker.io/v1/ --docker-username=pnxedudevops --docker-password='{{PASSWORD}}' --docker-email=pnx.edu.devops@gmail.com -o yaml --dry-run=client | kubeseal --format yaml --controller-namespace kubeseal --controller-name sealed-secrets > regcred-{{NAMESPACE}}.yaml
    ```

    - gitcred.yaml in gitea namespace (gitea credentials)
    - gitcred.yaml in ci namespace (gitea credentials)

    ```sh
    (LINUX)

    kubectl create secret generic gitcred -n {{NAMESPACE}} --from-literal=username=gitea --from-literal=password='{{PASSWORD}}' -o yaml --dry-run=client | kubeseal --format yaml --controller-namespace kubeseal --controller-name sealed-secrets > gitcred-{{NAMESPACE}}.yaml
    ```

6. Create overlays with your sealed secrets
    - create overlay folder e.g. dev-jozko-kukuricudus
        - k8s/apps/ci/overlays/dev-jozko-kukuricudus
        - k8s/apps/devops-app/overlays/dev-jozko-kukuricudus
    - copy and paste sealed secrets:
        - regcred-ci.yaml -> k8s/apps/ci/overlays/dev-jozko-kukuricudus
        - gitcred-ci.yaml -> k8s/apps/ci/overlays/dev-jozko-kukuricudus
        - regcred-devops-appp.yaml -> k8s/apps/devops-app/overlays/dev-jozko-kukuricudus
        - gitcred-gitea.yaml -> k8s/apps/gitea/templates/
    - create kustomization.yaml file under overlays
        - k8s/apps/ci/overlays/dev-jozko-kukuricudus

        ```yaml
        apiVersion: kustomize.config.k8s.io/v1beta1
        kind: Kustomization
        resources:
        - ../dev
        - regcred-ci.yaml
        - gitcred-ci.yaml
        ```

        - k8s/apps/devops-app/overlays/dev-jozko-kukuricudus

        ```yaml
        apiVersion: kustomize.config.k8s.io/v1beta1
        kind: Kustomization
        resources:
        - ../dev
        - regcred-devops-appp.yaml
        ```

    - add new overlays to ./k8s/app-of-apps-chart/values-dev-jozko-kukuricudus.yaml

    ```yaml
    ci:
        overlay: dev-jozko-kukuricudus
    devopsApp:
        overlay: dev-jozko-kukuricudus
    ```

7. Push all changes to your branch

8. Apply argocd application

    ```sh
    kubectl apply -f ./k8s/app-of-apps.yaml
    ```

9. Check if everything is working (devops-app will not work yet):
    - add hostnames to C:\Windows\System32\drivers\etc

    ```text
    <node IP> cluster.traefik.local
    <node IP> cluster.argocd.local
    <node IP> cluster.argowf.local
    <node IP> cluster.dev.local
    <node IP> cluster.gitea.local
    ```

    - now you can visit following URLs:
        - <http://cluster.traefik.local:8081> (state of cluster networking)
        - <http://cluster.argocd.local:8081> (state of applications)
            - username: admin
            - password: kubectl get secret -n argocd argocd-initial-admin-secret -o yaml (then decode the password on linux: echo {{PASSWORD}} | base64 -d)
        - <http://cluster.argowf.local:8081> (state of pipelines)
        - <http://cluster.gitea.local:8081> (gitea version control provider)
            - username: gitea
            - password: gitea123!

10. Create gitea repositories (<http://cluster.gitea.local:8081>)
    - create frontend-devops-app repo
    - create k8s repo

11. Copy and push code to new gitea repositories:
    - copy all files from ./src/frontend/* (do not copy node_modules or dist) to frontend-devops-app repo
    - copy all files from ./k8s/apps/devops-app/* to k8s repo
    - push changes in both repos

12. Check if frontend and backend apps were deployed
    - deployment status -> argo-cd ui <http://cluster.argocd.local:8081> (username and password from step number 9)
    - <http://cluster.dev.local:8081/frontend> (our frontend app)
    - <http://cluster.dev.local:8081/backend> (our backend app)

13. Create webhook in frontend-devops-app repo
    - URL: <http://webhook-eventsource.ci:12000/example>
    - HTTP Mehtod: POST
    - ContentType: application/json

14. Try pipeline by pushing new changes to frontend-devops-app repo. It should run the pipeline and deploy new version of application.
    - you can see pipeline progress on argo-workflows ui <http://cluster.argowf.local:8081>

15. Check if new version of frontend app was deployed
    - <http://cluster.dev.local:8081/frontend>

- (optional) Create your own overlay to overwrite default values
  - create new folder (overlay) for application e.g. ./apps/{{APP}}/overlays/dev-jozko-kukuricudus
  - add new overlay to values-{{OVERLAY}}.yaml file in ./app-of-apps-chart
  - push changes to your branch

    ```yaml
    traefik:
        overlay: dev-jozko-kukuricudus
    ```
  
- (optional) For helm charts create your own values to overwrite default values
  - e.g. ./k8s/apps/gitea/values-dev-jozko-kukuricudus.yaml
  - update your values file ./k8s/app-of-apps-chart/values-dev-jozko-kukuricudus.yaml

    ```yaml
    gitea:
        helmValues:
        - dev-jozko-kukuricudus
    ```
