# README

- Create namespace

```sh
kubectl apply -f namespace.yaml
```

- Make sure to have the eventbus pods running in the namespace. Run following command to create the eventbus.

```sh
kubectl apply -n argo-development -f https://raw.githubusercontent.com/argoproj/argo-events/stable/examples/eventbus/native.yaml
```

- Create a service account with RBAC settings to allow the sensor to trigger workflows, and allow workflows to function.

```sh
    # sensor rbac
kubectl apply -n argo-development -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/sensor-rbac.yaml
# workflow rbac
kubectl apply -n argo-development -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/workflow-rbac.yaml
```

- Apply our code

```sh
kubectl apply -f .
kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=pnxedudevops --docker-password=<password> --docker-email=pnx.edu.devops@gmail.com -n argo-development
```

- Create webhook in gitea

> URL: http://webhook-eventsource.argo-development:12000/example
 HTTP Mehtod: POST
 ContentType: application/json
