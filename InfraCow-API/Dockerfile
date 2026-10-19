# ---------- 1) Dependências de produção ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- 2) Runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Pasta de uploads (multer grava em /app/uploads) precisa ser gravável pelo
# usuário não-root. Como volume nomeado, herda esse dono na primeira criação.
RUN mkdir -p /app/uploads && chown -R node:node /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

# A API escuta em process.env.PORT (Render injeta; local/compose usam 3000).
EXPOSE 3000

# Usado pelo Docker/Compose (depends_on: service_healthy). O Render usa o
# healthCheckPath configurado no painel/render.yaml e ignora esta instrução.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q -O - "http://127.0.0.1:${PORT:-3000}/health" | grep -q '"status":"ok"' || exit 1

CMD ["node", "index.js"]
