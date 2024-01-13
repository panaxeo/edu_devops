# README

```sh
kubectl create namespace argo
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/v3.5.2/install.yaml

kubectl create secret docker-registry regcred -n argo --docker-server=https://index.docker.io/v1/ --docker-username=pnxedudevops --docker-password=<password> --docker-email=pnx.edu.devops@gmail.com

cat /etc/ssl/certs/ca-certificates.crt > ca-certificates.crt
# self signed crt created in gitea/README.md
cat tls.crt >> ca-certificates.crt
kubectl -n argo create configmap gitea-cert --from-file=ca-certificates.crt
```

```sh
kubectl apply -f build-image.yaml -n argo
kubectl create -f workflow.yaml -n argo
```
