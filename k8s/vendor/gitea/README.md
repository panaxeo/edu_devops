# README

```sh
helm repo add gitea-charts https://dl.gitea.com/charts/
```

```sh
helm repo update
```

```sh
kubectl apply -f config-map.yaml
kubectl apply -f service-account.yaml
kubectl apply -f secret-store.yaml
kubectl apply -f external-secret.yaml
```

```sh
helm install gitea gitea-charts/gitea --values values.yaml --namespace gitea --create-namespace
```

- for ingress on <http://cluster.gitea.local/> add this line to C:\Windows\System32\drivers\etc

    1. ```text
        <node IP> cluster.gitea.local
        ```

    2. ```sh
        kubectl apply -f ingress-route.yaml
        ```

username: gitea \
password: gitea123!

1. create repository:
frontend-devops-app
2. clone new repository outside this repo:

    ```sh
    git clone http://cluster.gitea.local/gitea/frontend-devops-app.git
    ```

3. copy our frontend app to cloned repo
4. push changes
