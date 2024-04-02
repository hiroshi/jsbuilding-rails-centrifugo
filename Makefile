PROJECT := topics-server
IMAGE = us-west1-docker.pkg.dev/$(PROJECT)/topics/topics

tag:
	$(eval TAG=$(shell git rev-parse --short HEAD))

build: tag
	docker build --platform=linux/amd64 -t $(IMAGE):$(TAG)  ./

push: tag
	docker push $(IMAGE):$(TAG)
	docker tag $(IMAGE):$(TAG) $(IMAGE):latest
	docker push $(IMAGE):latest

## GKE
deploy: topics

# topics
export TAG
topics: tag
	cat gke/topics.yaml | envsubst | kubectl apply -f -
	kubectl rollout status -w deployment/topics

secret-topics-env:
	kubectl create secret generic topics-env --from-env-file=development.env

# mongo
mongo:
	kubectl apply -f gke/mongo.yaml

# centrifugo
.PHONY: centrifugo
centrifugo:
	kubectl apply -f gke/centrifugo.yaml

secret-centrifugo-config:
	kubectl create secret generic centrifugo-config --from-file=config.json=centrifugo/production.json

# cloudflare tunnel
CLOUDFLARE_TUNNEL_ID := 148bff40-43c9-4b43-ab4d-0e7fd33542a6
cloudflared:
	kubectl apply -f gke/cloudflared.yaml

secret-cloudflare-credentials:
	kubectl create secret generic cloudflared-credentials \
	  --from-file=credentials.json=$(HOME)/.cloudflared/$(CLOUDFLARE_TUNNEL_ID).json

# NOTE: After generating add allowed origin
#   "allowed_origins": ["https://topics.yakitara.com"],
centrifugo-genconfig:
	docker compose run --rm centrifugo centrifugo genconfig -c production.json

# docker
docker-repository:
	gcloud artifacts repositories create topics \
	  --project=$(PROJECT) \
	  --location=us-west1 \
	  --repository-format=docker

artifact-registry-cleanup-policy:
	gcloud artifacts repositories set-cleanup-policies topics \
	  --project=$(PROJECT) \
	  --location=us-west1 \
	  --policy=gke/artifact-registry-cleanup-policy.yml

# cluster
GKE_VERSION := 1.29.2-gke.1521000
gke-cluster:
	gcloud container clusters create topics \
	  --project=$(PROJECT) \
	  --zone=us-west1-a \
	  --machine-type=e2-micro \
	  --num-nodes=1 \
	  --disk-type=pd-standard --disk-size=10G \
	  --cluster-version=$(GKE_VERSION)

gke-node-pool:
	gcloud container node-pools create e2-micro-spot \
	  --project=$(PROJECT) \
	  --cluster=topics --location=us-west1-a \
	  --machine-type=e2-micro \
	  --spot \
	  --num-nodes=1 \
	  --disk-type=pd-standard --disk-size=10G \
	  --enable-private-nodes
