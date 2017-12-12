# zenkube
Your deployments have faces, and history - get to know them!

# Run in your cluster
```bash
kubectl run zenkube -r=1 --image=codefresh/zenkube
kubectl port-forward $(kubectl get pods --template="{{ (index .items 0).metadata.name }}" --selector=run=zenkube) 8080:8080
```

Connect to http://localhost:8080

![Demo Animation](https://raw.githubusercontent.com/codefresh-io/zenkube/master/docs/zenkube.gif)