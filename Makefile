# Atalhos do dia a dia. Rode `make help`.
COMPOSE ?= docker compose

.DEFAULT_GOAL := help
.PHONY: help up upd lan down logs ps smoke rebuild reset

help: ## Lista os comandos
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  make %-9s %s\n", $$1, $$2}'

up: ## Sobe db + api + expo (em primeiro plano, com logs)
	$(COMPOSE) up --build

upd: ## Sobe tudo em segundo plano e espera ficar saudável
	$(COMPOSE) up -d --build --wait --wait-timeout 300

lan: ## Sobe tudo apontando para o IP da máquina (para testar no celular)
	@IP=$$(sh scripts/lan-ip.sh) || exit 1; \
	echo "IP da máquina: $$IP"; \
	HOST_LAN_IP=$$IP PUBLIC_API_URL=http://$$IP:3000 $(COMPOSE) up --build

down: ## Derruba os containers (mantém os dados)
	$(COMPOSE) down

logs: ## Acompanha os logs
	$(COMPOSE) logs -f --tail=100

ps: ## Estado e saúde dos serviços
	$(COMPOSE) ps

smoke: ## Teste de integração entre os serviços (rede interna do Docker)
	$(COMPOSE) --profile test run --rm smoke

rebuild: ## Reconstrói imagens e renova node_modules do Expo (após mudar dependências)
	$(COMPOSE) up --build --renew-anon-volumes

reset: ## CUIDADO: derruba tudo e APAGA banco e uploads locais
	$(COMPOSE) down -v
