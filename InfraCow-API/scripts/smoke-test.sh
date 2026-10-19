#!/bin/sh
# Smoke test ponta-a-ponta da InfraCow API (POSIX sh + curl, sem jq).
#
# Valida, de verdade, a cadeia  HTTP -> API -> Postgres -> JWT:
#   health -> cadastro -> login -> rota protegida -> rota sem token -> Swagger
# e, opcionalmente, se o servidor Expo (Metro) do app mobile está de pé.
#
# Variáveis:
#   API_URL              (padrão http://localhost:3000)
#   MOBILE_URL           (opcional, ex.: http://mobile:8081) -> checa só alcance
#   WAIT_TIMEOUT         segundos aguardando a API ficar saudável (padrão 120)
#   ALLOW_REMOTE=1       permite rodar contra um host *.onrender.com
#
# ATENÇÃO: o teste CRIA um usuário descartável no banco alvo. Por segurança ele
# recusa rodar contra o Render (produção) a menos que ALLOW_REMOTE=1.

API_URL="${API_URL:-http://localhost:3000}"
API_URL="${API_URL%/}"
MOBILE_URL="${MOBILE_URL:-}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-120}"

case "$API_URL" in
  *onrender.com*)
    if [ "${ALLOW_REMOTE:-0}" != "1" ]; then
      echo "Recusado: $API_URL parece produção (cria dados). Use ALLOW_REMOTE=1 se tiver certeza." >&2
      exit 2
    fi ;;
esac

PASS=0
ok()   { PASS=$((PASS + 1)); echo "  ✔ $*"; }
fail() { echo "  ✖ $*" >&2; exit 1; }

# request METHOD PATH [TOKEN] [JSON_BODY]  ->  define $CODE e $BODY
request() {
  _method="$1"; _path="$2"; _token="${3:-}"; _data="${4:-}"
  _out=$(curl -s -m 20 -X "$_method" "$API_URL$_path" \
    ${_token:+-H "Authorization: Bearer $_token"} \
    ${_data:+-H "Content-Type: application/json" -d "$_data"} \
    -w '\n%{http_code}') || _out="
000"
  CODE=$(printf '%s' "$_out" | tail -n 1)
  BODY=$(printf '%s' "$_out" | sed '$d')
}

echo "==> Smoke test em $API_URL"

# 1) Health (aguarda a API + banco subirem)
echo "[1/6] Health"
i=0
until request GET /health && [ "$CODE" = "200" ] && printf '%s' "$BODY" | grep -q '"status":"ok"'; do
  i=$((i + 2))
  [ "$i" -ge "$WAIT_TIMEOUT" ] && fail "API não ficou saudável em ${WAIT_TIMEOUT}s (último HTTP $CODE)"
  sleep 2
done
ok "GET /health -> 200 {status:ok}"

# 2) Cadastro (exercita escrita no Postgres + bcrypt)
echo "[2/6] Cadastro"
STAMP="$(date +%s)-$$"
EMAIL="smoke-$STAMP@infracow.test"
SENHA="Smoke#$STAMP"
request POST /usuario "" "{\"nome\":\"Smoke Test\",\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}"
[ "$CODE" = "201" ] || fail "POST /usuario esperado 201, veio $CODE: $BODY"
ok "POST /usuario -> 201"

# 3) Login (leitura no banco + bcrypt.compare + JWT)
echo "[3/6] Login"
request POST /login "" "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}"
[ "$CODE" = "200" ] || fail "POST /login esperado 200, veio $CODE: $BODY"
TOKEN=$(printf '%s' "$BODY" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[ -n "$TOKEN" ] || fail "login sem token na resposta: $BODY"
ok "POST /login -> 200 com token JWT"

# 4) Rotas protegidas com token
echo "[4/6] Rotas protegidas"
request GET /usuarios "$TOKEN"
[ "$CODE" = "200" ] || fail "GET /usuarios esperado 200, veio $CODE: $BODY"
printf '%s' "$BODY" | grep -q "$EMAIL" || fail "GET /usuarios não devolveu o usuário logado"
ok "GET /usuarios (com token) -> 200 e usuário correto"
request GET /fazendas "$TOKEN"
case "$CODE" in
  200|404) ok "GET /fazendas (com token) -> $CODE (autenticado e consulta ao banco OK)" ;;
  *) fail "GET /fazendas esperado 200/404, veio $CODE: $BODY" ;;
esac

# 5) Rota protegida sem token deve ser barrada
echo "[5/6] Autorização"
request GET /usuarios
[ "$CODE" = "401" ] || fail "GET /usuarios sem token esperado 401, veio $CODE"
ok "GET /usuarios (sem token) -> 401"

# 6) Swagger (swagger-jsdoc lê src/routes/*.js do disco: prova que a imagem tem os arquivos)
echo "[6/6] Swagger"
SW=$(curl -s -L -m 20 -o /dev/null -w '%{http_code}' "$API_URL/api-docs/") || SW=000
[ "$SW" = "200" ] || fail "GET /api-docs/ esperado 200, veio $SW"
ok "GET /api-docs/ -> 200"

# Opcional: servidor Expo/Metro alcançável pela rede
if [ -n "$MOBILE_URL" ]; then
  echo "[+] Mobile (Expo/Metro) em $MOBILE_URL"
  MC=$(curl -s -m 15 -o /dev/null -w '%{http_code}' "${MOBILE_URL%/}/status") || MC=000
  [ "$MC" != "000" ] || fail "servidor Expo não respondeu em $MOBILE_URL"
  ok "Expo/Metro responde (HTTP $MC)"
fi

echo "==> OK: $PASS verificações passaram"
