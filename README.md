# InfraCow — DevOps / CI-CD

Workspace que junta os dois repositórios (**InfraCow-API** e **InfraCow-Mobile**) e automatiza
o ciclo completo: subir tudo local com Docker, testar, publicar a API no Render e o app no Expo.

```
InfraCow/                      <- este repositório (orquestração)
├── docker-compose.yml         db + api + mobile (+ smoke)
├── Makefile · scripts/        atalhos
├── .github/workflows/e2e.yml  teste de integração do sistema inteiro
├── InfraCow-API/              repo da API    (clone ao lado)
└── InfraCow-Mobile/           repo do app    (clone ao lado)
```

## 1. Subir tudo (um comando)

Pré-requisito: Docker com Compose v2. Clone os dois repositórios como pastas irmãs deste arquivo
(ou aponte `API_PATH` / `MOBILE_PATH` no `.env`).

```bash
make up            # = docker compose up --build   (logs na tela)
make upd           # em segundo plano, espera tudo ficar saudável
make smoke         # teste de integração entre os serviços
make lan           # sobe apontando para o IP da máquina (testar no celular)
make help          # todos os comandos
```

| Serviço | URL | Observação |
|---------|-----|-----------|
| API | http://localhost:3000 | `/health`, Swagger em `/api-docs` |
| Expo (Metro) | http://localhost:8081 | web e dev client |
| PostgreSQL | só na rede interna | volume `pgdata` |

## 2. Como os serviços se comunicam

```
 navegador / celular ──► mobile:8081 (Metro)     serve o bundle; API_URL vai embutida nele
        │
        └──► api:3000 (PUBLIC_API_URL)           o APP chama a API de fora do Docker
                  │
                  └──► db:5432                   API -> Postgres, pela rede interna (DB_HOST=db)

 ordem de subida:  db (healthy) ─► api (healthy) ─► mobile (espera a API em http://api:3000/health)
 smoke (profile test) ─► api:3000 e mobile:8081 pela rede interna
```

Ponto-chave: o app roda no **navegador/celular**, não dentro do container. Por isso `PUBLIC_API_URL`
é `http://localhost:3000` na web e `http://IP_DA_MAQUINA:3000` no celular (`make lan` faz isso).

## 3. CI/CD

| Onde | Workflow | Gatilho | Resultado |
|------|----------|---------|-----------|
| API | `CI/CD - API` | PR / main | testes com Postgres real → teste da imagem Docker → **publica no Docker Hub** → **deploy no Render** → espera `/health` |
| Mobile | `CI/CD - Mobile` | PR / main | bundle Android → imagem Docker/Metro → **publica OTA no Expo** (EAS Update, canal `production`) |
| Mobile | `EAS Build` | manual / tag `v*` | **build APK/AAB** no EAS |
| Workspace | `E2E` | push / PR / segunda 06:00 UTC | db + api + expo no compose e smoke test |

### Configuração única (checklist)

**Repositório da API** — Settings → Secrets and variables → Actions
- Secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `RENDER_DEPLOY_HOOK` (Render → Settings → Deploy Hook)
- Variable (opcional): `RENDER_SERVICE_URL`

**Repositório do Mobile**
- Secret: `EXPO_TOKEN` (expo.dev → Account Settings → Access Tokens)
- Variable (opcional): `API_URL` — sem ela vale o `app.json` (API do Render)

**Repositório do workspace** — nada obrigatório. Se API/Mobile forem privados: secret `REPOS_TOKEN`
(PAT com leitura nos dois). Os nomes `TW-TECH-SP2/InfraCow-API|Mobile` em `e2e.yml` vêm dos `package.json`/README.

Recomendado: em Settings → Branches, exigir os checks `test` / `docker` (API) e `quality` (Mobile) antes do merge.

## 4. O que NÃO mudou

Nenhum arquivo de `src/`, `index.js`, `swagger.js`, `App.tsx`, `package.json`, `package-lock.json`,
`app.json`, `eas.json` ou de banco/modelos foi alterado. Só foram criados/alterados arquivos de
Docker, Compose, GitHub Actions, Render, documentação e `app.config.js` (veja [MUDANCAS.md](MUDANCAS.md)).

## 5. Limitações conhecidas

- **`Home` e `Farm` do app** têm a URL do Render escrita no código (para montar imagens). Mesmo com
  `API_URL` apontando para a API local, as imagens dessas telas continuam vindo do Render. Isso é código
  de front-end (fora do escopo); a correção é usar `Constants.expoConfig.extra.API_URL`, como as outras telas.
- **Expo Go não funciona** com este projeto (módulos nativos). No celular use o dev client / APK
  (`EAS Build`, perfil `development`/`preview`). No navegador use a versão web do Metro.
- `tsc` e `expo-doctor` rodam no CI como **informativos** e o Metro-no-Docker como **não bloqueante**
  até o primeiro run verde (marcados com `continue-on-error` + comentário).
- O Render grátis pode levar minutos para acordar; o job de deploy espera até ~10 min.

## 6. Problemas comuns

| Sintoma | Causa / solução |
|--------|-----------------|
| `password authentication failed` após mudar `DB_USER/DB_PASSWORD` | o volume guarda as credenciais antigas: `make reset` (apaga dados locais) |
| API sobe mas app não conecta no celular | use `make lan` e celular na mesma rede; libere a porta 3000/8081 no firewall |
| Mudei dependências do app e o container não vê | `make rebuild` (renova o volume de `node_modules`) |
| Expo reclama de permissão em `.expo` (Linux) | o container roda como uid 1000; se seu usuário for outro: `sudo chown -R 1000:1000 InfraCow-Mobile` |
| Hot reload não dispara no Windows/macOS | evento de arquivo do bind mount; reinicie o serviço `mobile` ou use WSL2 |
