#!/bin/sh
# Entrypoint do container Expo.
#  - (opcional) espera a API responder antes de subir o Metro -> garante a
#    comunicação entre serviços na ordem certa quando rodando via compose.
#  - mostra de forma clara para onde o app vai apontar.
set -e

API_URL_EFFECTIVE="${API_URL:-<padrão do app.json>}"
echo "[infracow] API usada pelo app: ${API_URL_EFFECTIVE}"

if [ -n "${WAIT_FOR_API:-}" ]; then
  echo "[infracow] Aguardando a API em ${WAIT_FOR_API} (até ${WAIT_FOR_API_TIMEOUT:-120}s)..."
  if node -e '
    const url = process.argv[1];
    const timeout = Number(process.env.WAIT_FOR_API_TIMEOUT || 120) * 1000;
    const start = Date.now();
    const tick = async () => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) { console.log("[infracow] API respondeu: HTTP " + res.status); process.exit(0); }
      } catch (_) {}
      if (Date.now() - start > timeout) process.exit(1);
      setTimeout(tick, 2000);
    };
    tick();
  ' "$WAIT_FOR_API"; then
    :
  else
    echo "[infracow] AVISO: a API não respondeu a tempo; subindo o Expo mesmo assim."
  fi
fi

if [ -n "${REACT_NATIVE_PACKAGER_HOSTNAME:-}" ]; then
  echo "[infracow] Metro anunciado para dispositivos em ${REACT_NATIVE_PACKAGER_HOSTNAME}:8081"
else
  echo "[infracow] Web: http://localhost:8081  |  Celular na mesma rede: defina HOST_LAN_IP (ou use 'make lan')"
fi

exec "$@"
