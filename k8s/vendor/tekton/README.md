Add tekton pipeline to local cluster
```sh
kubectl apply --filename https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
```

Add tekton dashboard to local cluster
```sh
kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/release.yaml
```

To run tekton dashboards
```sh
kubectl proxy
```
and then go to
```sh
http://localhost:8001/api/v1/namespaces/tekton-pipelines/services/tekton-dashboard:http/proxy/
```

Add 'tekton-development' namespace
```sh
kubectl apply --filename namespace.yaml
```

Create a gitea secret
```sh
kubectl create -f gitea-secret.yaml
```

Create a gitea bot service account
```sh
kubectl create -f gitea-bot.yaml
```

Add git-clone task from tekton hub
```sh
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml -n tekton-development
```

Add NPM task from tekton hub
```sh
kubectl apply -f https://api.hub.tekton.dev/v1/resource/tekton/task/npm/0.1/raw -n tekton-development
```

Add Kaniko task from tekton hub
```sh
kubectl apply -f https://api.hub.tekton.dev/v1/resource/tekton/task/kaniko/0.6/raw -n tekton-development
```

Create a pipeline
```sh
kubectl apply -f build.yaml
```

Create a pipeline-run
```sh
kubectl create -f build-run.yaml
```
and visit tekton dashboards to see how the run has ended