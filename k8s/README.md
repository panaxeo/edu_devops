# This folder contains Kubernetes manifests

* to apply resource

    ```bash
    kubectl apply -f <manifest.yaml>
    ```

* to delete resource

    ```bash
    kubectl delete -f <manifest.yaml>
    ```

* to delete all resources in a namespace

    ```bash
    kubectl delete all --all -n <namespace>
    ```

* to create a secret by providing credentials

    ```bash
    kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=<your-name> --docker-password=<your-pword> --docker-email=<your-email> -n <namespace>
    ```

* to annotate the secret
```bash
kubectl annotate Secret regcred tekton.dev/docker-0=https://index.docker.io/v1/ -n tekton-development
```

* to get services (IP, PORT)

    ```bash
    kubectl get services -n <namespace>
    ```
