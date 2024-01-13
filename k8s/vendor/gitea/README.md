# README

```sh
helm repo add gitea-charts https://dl.gitea.com/charts/
```

```sh
helm repo update
```

```sh
helm install gitea gitea-charts/gitea \
--values values.yaml \
--namespace gitea \
--create-namespace
```

gitea is running on localhost:30007 \
username: gitea \
password: gitea123!

1. create repository:
frontend-devops-app
2. clone new repository outside this repo:

    ```sh
    git clone http://localhost:30007/gitea/frontend-devops-app.git
    ```

3. copy our frontend app to cloned repo
4. push changes

```sh
openssl req -x509 -newkey rsa:2048 -keyout tls.key -out tls.crt -days 365 -nodes -subj "/C=SK/ST=Slovakia/L=Senec/O=Pnx/CN=gitealocal" -addext "subjectAltName = DNS:gitealocal"

kubectl create secret tls gitea-tls-secret -n gitea --cert=tls.crt --key=tls.key
```
