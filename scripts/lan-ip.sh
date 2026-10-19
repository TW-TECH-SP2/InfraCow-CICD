#!/bin/sh
# Imprime o IP da máquina na rede local (usado por `make lan` para o celular
# alcançar o Metro e a API). Linux, macOS e WSL.
ip=""
if command -v ip >/dev/null 2>&1; then
  ip=$(ip route get 1.1.1.1 2>/dev/null | sed -n 's/.* src \([0-9.]*\).*/\1/p' | head -n 1)
fi
if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$ip" ] && command -v ipconfig >/dev/null 2>&1; then
  ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi
if [ -z "$ip" ]; then
  echo "Não consegui descobrir o IP. Defina HOST_LAN_IP manualmente (ex.: HOST_LAN_IP=192.168.0.10 make up)." >&2
  exit 1
fi
echo "$ip"
