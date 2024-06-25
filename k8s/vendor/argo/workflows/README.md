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

## http

    ```bash
kubectl -n argo patch deployment argo-server --type='json' -p='[
   {
     "op": "add",
     "path": "/spec/template/spec/containers/0/args/-",
     "value": "--secure=false"
   },
   {
     "op": "replace",
     "path": "/spec/template/spec/containers/0/readinessProbe/httpGet/scheme",
     "value": "HTTP"
   }
 ]'
    ```

    ```bash
    kubectl apply -f ingress-route.yaml
    ```
