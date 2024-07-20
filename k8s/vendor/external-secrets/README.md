# README

```bash
kubectl apply -f "https://raw.githubusercontent.com/external-secrets/external-secrets/v0.9.19/deploy/crds/bundle.yaml"
```

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace
```

```bash
kubectl apply -f .\namespace.yaml
kubectl apply -f .\cluster-role.yaml
kubectl apply -f .\cluster-role-binding.yaml
```

```bash
kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=pnxedudevops --docker-password=<password> --docker-email=pnx.edu.devops@gmail.com -n secret-store
```

```bash
kubectl create secret generic gitea-creds -n secret-store --from-literal=username=gitea --from-literal=password=gitea123! --from-literal=email=gitea@gitea.com
```
