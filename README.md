# InfraCow — DevOps / CI-CD

Monorepo com **InfraCow-API** e **InfraCow-Mobile** e todo o ciclo automatizado:
subir tudo local com Docker, testar, publicar a API no Render e o app no Expo.
> Os workflows ficam na **raiz** (`.github/workflows/`) — é o único lugar que o GitHub executa.

```
InfraCow/
├── docker-compose.yml           db + api + mobile (+ smoke)
├── Makefile · scripts/          atalhos
├── render.yaml                  Blueprint do Render (opcional)
├── .github/
│   ├── workflows/api-ci.yml            API: testes -> Docker -> Docker Hub -> Render
│   ├── workflows/mobile-ci.yml         App: qualidade -> Docker -> OTA (EAS Update)
│   ├── workflows/mobile-eas-build.yml  App: build APK/AAB (manual ou tag mobile-v*)
│   ├── workflows/e2e.yml               sistema inteiro no compose
│   └── dependabot.yml
├── InfraCow-API/
└── InfraCow-Mobile/
```

## 1. Subir tudo (um comando)

Pré-requisito: Docker com Compose v2. (`API_PATH` / `MOBILE_PATH` no `.env` só são necessários
se você mover as pastas.)

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

| Workflow | Gatilho (só se a pasta mudou) | Resultado |
|----------|-------------------------------|-----------|
| `CI/CD - API` (`api-ci.yml`) | PR / push main em `InfraCow-API/**` | testes com Postgres real (inclui **contrato do sync offline**) → teste da imagem Docker → **publica no Docker Hub** → **deploy no Render** → espera `/health` |
| `CI/CD - Mobile` (`mobile-ci.yml`) | PR / push main em `InfraCow-Mobile/**` | bundle Android → imagem Docker/Metro → **publica OTA no Expo** (EAS Update, canal `production`) |
| `Mobile - EAS Build` (`mobile-eas-build.yml`) | manual ou tag `mobile-v*` | **build APK/AAB** no EAS |
| `E2E` (`e2e.yml`) | PR / push / segunda 06:00 UTC | db + api + expo no compose e smoke test |

### Configuração única (checklist)

Tudo em Settings → Secrets and variables → Actions **deste repositório**:

**API**
- Secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `RENDER_DEPLOY_HOOK` (Render → Settings → Deploy Hook)
- Variable (opcional): `RENDER_SERVICE_URL`

**Mobile**
- Secret: `EXPO_TOKEN` (expo.dev → Account Settings → Access Tokens)
- Variable (opcional): `API_URL` — sem ela vale o `app.json` (API do Render)

Recomendado: em Settings → Branches, exigir os checks `test` / `docker` (API) e `quality` (Mobile) antes do merge. Como os workflows usam filtro de caminho, marque-os como obrigatórios só se aceitar que PRs sem mudança na pasta fiquem sem esse check.

## 4. O que o DevOps NÃO altera

Nenhum arquivo de `src/` (API ou app), `index.js`, `swagger.js`, `package*.json`, `app.json`, `eas.json`
ou de banco/modelos. Só Docker, Compose, GitHub Actions, Render, documentação e `app.config.js`
(veja [MUDANCAS.md](MUDANCAS.md)).

### App com modo offline (SQLite + fila)

O app grava tudo primeiro no SQLite do celular e sincroniza quando a internet volta. Consequências no DevOps:
- O smoke test da API (etapa 7) reproduz as **mesmas requisições da fila offline** (multipart de fazenda/animal,
  JSON de medição, PUT/DELETE) e exige o id do servidor na resposta; se a API quebrar esse contrato o CI reprova
  — no app isso viraria dado perdido em silêncio (a fila descarta a operação após 5 falhas).
- **OTA:** o JS novo usa `expo-sqlite` e `@react-native-community/netinfo`. O OTA só é seguro para builds que já
  tenham esses módulos nativos (o `runtimeVersion` é fixo em `1.0.0`). Confirme com `eas build:list` ou gere um build novo
  (`Mobile - EAS Build`) e incremente o `runtimeVersion` **antes** de configurar o `EXPO_TOKEN`.

## 5. Limitações conhecidas

- **`Home` e `Farm` do app** têm a URL do Render escrita no código (para montar imagens). Mesmo com
  `API_URL` apontando para a API local, as imagens dessas telas continuam vindo do Render. Isso é código
  de front-end (fora do escopo); a correção é usar `Constants.expoConfig.extra.API_URL`, como as outras telas.
- **Expo Go não funciona** com este projeto (módulos nativos). No celular use o dev client / APK
  (`EAS Build`, perfil `development`/`preview`). No navegador use a versão web do Metro.
- **Web (Metro no Docker) com SQLite:** `src/storage/db.ts` abre o banco no import; `expo-sqlite` na web exige
  wasm + cabeçalhos COOP/COEP, que o `metro.config.js` não configura. A versão web pode não abrir; o caminho
  testado em campo é celular (dev client/APK). Não consegui validar isso aqui.
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
