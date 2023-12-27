# README

```sh
kubectl apply --filename https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
kubectl apply --filename https://github.com/shipwright-io/build/releases/download/v0.11.0/release.yaml
```

<!-- ## prerequisites

```sh
wsl instance with kubeconfig
sudo apt-get install jq
```

```sh
curl --silent --location https://raw.githubusercontent.com/shipwright-io/build/v0.12.0/hack/setup-webhook-cert.sh | bash
``` -->

```sh
# optional: install all build strategies
kubectl apply --filename https://github.com/shipwright-io/build/releases/download/v0.11.0/sample-strategies.yaml
# or install just kaniko strategy kubectl apply -f ./kaniko-strategy.yaml
```

```sh
kubectl create secret docker-registry regcred -n shipwright-build --docker-server=https://index.docker.io/v1/ --docker-username=pnxedudevops --docker-password=<password> --docker-email=pnx.edu.devops@gmail.com
```
