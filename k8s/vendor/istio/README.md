# README

The Kubernetes Gateway API CRDs do not come installed by default on most Kubernetes clusters, so make sure they are installed before using the Gateway API:

```sh
$ kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
  { kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.0.0" | kubectl apply -f -; }
```

1. Go to the Istio release page to download the installation file for your OS, or download and extract the latest release automatically (Linux or macOS):

    ```sh
    curl -L https://istio.io/downloadIstio | sh -
    ```

2. Move to the Istio package directory. For example, if the package is istio-1.20.3:

    ```sh
    cd istio-1.20.3
    ```

3. Add the istioctl client to your path (Linux or macOS):

    ```sh
    export PATH=$PWD/bin:$PATH
    ```

4. Install Istio

    ```sh
    istioctl install -f samples/bookinfo/demo-profile-no-gateways.yaml -y
    ```
