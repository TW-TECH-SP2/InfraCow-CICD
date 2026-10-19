# Servidor de desenvolvimento Expo (Metro) em container.
# Equivale a rodar `npx expo start` na sua máquina, mas sem instalar nada local.
#
#   docker build -t infracow-mobile .
#   docker run --rm -p 8081:8081 -e API_URL=http://localhost:3000 infracow-mobile
#
# Para subir junto com a API e o banco, use o docker-compose.yml da raiz do workspace.

FROM node:26-bookworm-slim AS base
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    EXPO_NO_TELEMETRY=1
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# ---------- dependências (camada cacheada enquanto package*.json não mudar) ----------
FROM base AS deps
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# ---------- imagem de desenvolvimento ----------
FROM deps AS dev
COPY --chown=node:node . .
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/infracow-entrypoint.sh

# 8081 = Metro (app nativo / dev client) e versão web
EXPOSE 8081

ENTRYPOINT ["sh", "/usr/local/bin/infracow-entrypoint.sh"]
CMD ["npx", "expo", "start", "--port", "8081"]
