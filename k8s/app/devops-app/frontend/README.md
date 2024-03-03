# README

- Add a namespace label to instruct Istio to automatically inject Envoy sidecar proxies when you deploy your application later:

```sh
kubectl label namespace development istio-injection=enabled
kubectl apply -f ./frontend
```

- Ensure that there are no issues with the configuration:

```sh
istioctl analyze
```

- (optional) View the dashboard
https://istio.io/latest/docs/setup/additional-setup/getting-started/#dashboard
