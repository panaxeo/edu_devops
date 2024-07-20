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

* to get services (IP, PORT)

```bash
kubectl get services -n <namespace>
```
