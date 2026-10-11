COMPOSE := docker compose -f deploy/docker-compose.yml
PEER_CONF := deploy/wireguard/peer_reviewer/peer_reviewer.conf

.PHONY: help install dev build typecheck up down logs verify vpn-config clean

help: ## List available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm ci

dev: ## Run the local dev server at http://localhost:8080
	npm start

build: ## Build the production bundle into dist/
	npm run build

typecheck: ## Type-check the TypeScript sources
	npm run typecheck

up: ## Build and start the private network, app, and VPN gateway
	@# The image's default peer template sets ListenPort = 51820, which clashes
	@# with Docker's published port when the client runs on the same machine.
	@mkdir -p deploy/wireguard/templates
	@cp deploy/peer.conf.template deploy/wireguard/templates/peer.conf
	SERVERURL=$(SERVERURL) $(COMPOSE) up -d --build
	@echo "Waiting for VPN peer configs..."
	@for i in $$(seq 1 30); do [ -f $(PEER_CONF) ] && break; sleep 1; done
	@[ -f $(PEER_CONF) ] || { echo "Peer config was not generated; check 'make logs'."; exit 1; }
	@echo "VPN client config: $(PEER_CONF)"

down: ## Stop and remove the containers and networks
	$(COMPOSE) down

logs: ## Follow container logs
	$(COMPOSE) logs -f

verify: ## Prove the app is reachable only through the VPN
	./deploy/verify.sh

vpn-config: ## Print the reviewer's WireGuard client config
	@cat $(PEER_CONF)

clean: down ## Stop everything and delete generated VPN keys
	rm -rf deploy/wireguard
