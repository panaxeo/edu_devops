# README

- The first step is to create namespace.

```sh
kubectl apply -f namespace.yaml
```

- The next step is to create the role. The ClusterRole resource enumerates the resources and actions available for the role.

```sh
kubectl apply -f cluster-role.yaml
```

- The next step is to create a dedicated service account for Traefik.

```sh
kubectl apply -f service-account.yaml
```

- And then, bind the role on the account to apply the permissions and rules on the latter.

```sh
kubectl apply -f cluster-role-binding.yaml
```

- To start Traefik on the Kubernetes cluster, a Deployment resource must exist to describe how to configure and scale containers horizontally to support larger workloads.

```sh
kubectl apply -f deployment.yaml
```

A deployment manages scaling and then can create lots of containers, called Pods. Each Pod is configured following the spec field in the deployment.
Given that, a Deployment can run multiple Traefik Proxy Pods, a piece is required to forward the traffic to any of the instance: namely a Service.

```sh
kubectl apply -f loadbalancer.yaml
kubectl apply -f ingress-class.yaml
```

- (optional) Traefik dashboard
    1. for ingress on <http://traefik> add this line to C:\Windows\System32\drivers\etc

        ```text
        <node IP> traefik
        ```

    2. ```sh
        kubectl apply -f dashboard-service.yaml
        kubectl apply -f ingress.yaml
        ```
