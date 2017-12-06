# zenkube
Your deployments have faces, and history - get to know them!

# Run in your cluster
```bash
kubectl run zenkube -r=1 --image=webwise10/zenkube
kubectl port-forward $(kubectl get pods --template="{{range .items}}{{.metadata.name}}{{end}}" --selector=run=zenkube) 8080:8080
```

Connect to http://localhost:8080

![Demo Animation](https://raw.githubusercontent.com/codefresh-io/zenkube/master/docs/zenkube.gif)