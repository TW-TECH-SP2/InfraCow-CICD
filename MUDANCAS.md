# Relatório de mudanças (somente DevOps / CI-CD)

## Alterados (já existiam)
| Arquivo | O que mudou | Por quê |
|---|---|---|
| `InfraCow-API/Dockerfile` | `npm ci --omit=dev`, usuário não-root, pasta `uploads` gravável, `HEALTHCHECK` | segurança + permite `depends_on: service_healthy` |
| `InfraCow-API/docker-compose.yml` | sem `env_file` obrigatório; `DB_HOST=db`, `PORT=3000` e `DATABASE_URL=""` fixos no container; volume de uploads; padrões de variáveis; removido `version:` | antes: `DB_HOST=localhost` do `.env` quebrava dentro do container e `PORT≠3000` quebrava o mapeamento |
| `InfraCow-API/.dockerignore` | exclui `.github`, `scripts`, `uploads`, `.env*` etc. | imagem menor/segura |
| `InfraCow-API/.env.example` | valores de exemplo utilizáveis + comentários | antes `PORT=porta_da_api` (inválido) |
| `InfraCow-API/.github/workflows/ci.yml` | reescrito (ver abaixo) | |
| `InfraCow-API/README.md`, `InfraCow-Mobile/README.md` | seção "DevOps / CI-CD" ao final | documentação |

## Criados
| Arquivo | Função |
|---|---|
| `InfraCow-API/scripts/smoke-test.sh` | health → cadastro → login → rota protegida → 401 sem token → Swagger (+ alcance do Expo) |
| `InfraCow-API/render.yaml` | Blueprint do Render (opcional, não afeta o serviço atual) |
| `InfraCow-API/.github/dependabot.yml`, `.gitattributes` | atualizações automáticas; LF em scripts |
| `InfraCow-Mobile/Dockerfile`, `.dockerignore`, `docker-compose.yml`, `docker/entrypoint.sh` | servidor Expo em container (espera a API quando `WAIT_FOR_API`) |
| `InfraCow-Mobile/app.config.js` | permite `API_URL` por variável de ambiente; **sem a variável devolve o `app.json` idêntico** |
| `InfraCow-Mobile/.github/workflows/ci.yml` | CI + OTA no Expo (EAS Update) |
| `InfraCow-Mobile/.github/workflows/eas-build.yml` | build APK/AAB sob demanda ou por tag `v*` |
| `InfraCow-Mobile/.github/dependabot.yml`, `.gitattributes` | idem API |
| raiz: `docker-compose.yml`, `.env.example`, `Makefile`, `scripts/lan-ip.sh`, `.github/workflows/e2e.yml`, `README.md` | orquestra db + api + mobile e testa a integração |

## Correções no CI da API (ci.yml)
1. Service container do Postgres **não tinha `ports`**: a API nunca conectava ao banco no CI e o `/health` passava mesmo assim → adicionado `5432:5432`.
2. Faltava `JWT_SECRET` → login nunca era exercitado. Agora o smoke test cobre cadastro/login/rota protegida.
3. Build com `docker/build-push-action@v3` sem buildx/cache e só tag `latest` → v6, cache GHA, tags `latest` + `sha-<commit>` (mesmo nome de imagem: o Render segue puxando `latest`).
4. Deploy agora só roda depois de testes + teste Docker, e confirma `/health` depois.
5. PRs rodam CI sem publicar nada; execuções concorrentes são controladas.

## NÃO alterados (verificado por hash)
`src/` (API e app), `index.js`, `swagger.js`, `App.tsx`, `package.json`, `package-lock.json`, `app.json`, `eas.json`, `metro.config.js`, `tsconfig.json`, `assets/`, `.gitignore`, modelos/banco.
