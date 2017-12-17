# zenkube
Your deployments have faces, and history - get to know them!

# Description
Zenkube is an easy to deploy utility that logs and monitors deployments in your cluster. It provides a friendly way to keep track of deployments by assigning a synthesized, unique hash to every new deployment revision, in a git-esque style. Every deployment is symbolized with a [robohash](https://robohash.org/) for quick identification.      

# Run within your cluster

Use `kubectl` to deploy Zenkube from its image (`codefresh/zenkube`):

```bash
kubectl run zenkube -r=1 --image=codefresh/zenkube
kubectl port-forward $(kubectl get pods --template="{{ (index .items 0).metadata.name }}" --selector=run=zenkube) 8080:8080
```

Then simply use your browser to open `http://localhost:8080`, and be prepared to personally meet your deployments for the very first time! Can you feel the excitement?

![Demo Animation](https://raw.githubusercontent.com/codefresh-io/zenkube/master/docs/zenkube.gif)