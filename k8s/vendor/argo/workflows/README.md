# README

    ```bash
kubectl create namespace argo
    ```

    ```bash
kubectl apply -n argo -f <https://github.com/argoproj/argo-workflows/releases/download/v3.5.4/quick-start-minimal.yaml>
kubectl apply -n argo -f <https://github.com/argoproj/argo-workflows/releases/download/v3.5.4/install.yaml>
    ```

    ```bash
kubectl patch deployment argo-server --namespace argo --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": ["server","--auth-mode=server"]}]'

    ```

    ```bash Run UI - https://localhost:2746/
kubectl -n argo port-forward deployment/argo-server 2746:2746
kubectl -n argo port-forward service/argo-server 2746:2746
    ```
