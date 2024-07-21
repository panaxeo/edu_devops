# This folder contains manual for creating sealed-secrets
# https://github.com/bitnami-labs/sealed-secrets

* Install the sealed-secrets helm chart
    ```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets -n kube-system --set-string fullnameOverride=sealed-secrets-controller sealed-secrets/sealed-secrets
    ```

* Get existing secret (e.g. regcred) and save it (e.g. regcred.json)
    ```bash
kubectl -n development get secret regcred -o json > regcred.json
    ```

* or create a secret
    ```bash
    kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=<your-name> --docker-password=<your-pword> --docker-email=<your-email> -n <namespace>
    ```

* Download a client-side utility kubeseal https://github.com/bitnami-labs/sealed-secrets/releases/
* unzip it into a folder
* Copy regcred.json to the folder with "kubeseal.exe" and use kubeseal to encrypt the secret. The output is "sealed-regcred.yaml" which is safe to upload
    ```bash
kubeseal --format yaml <regcred.json> sealed-regcred.yaml
    ```