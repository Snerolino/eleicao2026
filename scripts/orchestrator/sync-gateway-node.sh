#!/usr/bin/env bash
set -euo pipefail

PROFILE="${HERMES_ORCH_PROFILE:-eleicao2026}"
SERVICE="hermes-gateway-${PROFILE}.service"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$REAL_HOME/.hermes/hermes-agent}"

if ! command -v node >/dev/null 2>&1; then
  echo "node não encontrado no PATH do shell" >&2
  exit 10
fi

NODE_BIN="$(readlink -f "$(command -v node)")"
NODE_DIR="$(dirname "$NODE_BIN")"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
NODE_VERSION="$(node -v)"

if [[ "$NODE_MAJOR" != "24" ]]; then
  echo "Node 24 é obrigatório para eleicao2026; shell atual usa $NODE_VERSION" >&2
  exit 11
fi

if ! systemctl --user cat "$SERVICE" >/dev/null 2>&1; then
  echo "serviço $SERVICE não encontrado; instale/inicie o gateway Hermes primeiro" >&2
  exit 12
fi

DROPIN_DIR="$REAL_HOME/.config/systemd/user/${SERVICE}.d"
DROPIN="$DROPIN_DIR/70-eleicao2026-node24.conf"
mkdir -p "$DROPIN_DIR"

# NODE_DIR vem primeiro: não basta ele existir em algum ponto do PATH se uma
# entrada anterior puder fornecer outro binário node.
cat >"$DROPIN" <<EOF
[Service]
Environment="PATH=$NODE_DIR:$HERMES_AGENT_HOME/venv/bin:$HERMES_AGENT_HOME/node_modules/.bin:$REAL_HOME/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
EOF

systemctl --user daemon-reload
hermes -p "$PROFILE" gateway restart >/dev/null

MAIN_PID="$(systemctl --user show "$SERVICE" -p MainPID --value)"
if [[ ! "$MAIN_PID" =~ ^[1-9][0-9]*$ || ! -r "/proc/$MAIN_PID/environ" ]]; then
  echo "gateway reiniciou, mas não foi possível ler o ambiente do processo ativo" >&2
  exit 13
fi

SERVICE_PATH="$(tr '\0' '\n' < "/proc/$MAIN_PID/environ" | sed -n 's/^PATH=//p' | head -n1)"
EFFECTIVE_NODE="$(env PATH="$SERVICE_PATH" sh -c 'command -v node' 2>/dev/null || true)"
EFFECTIVE_NODE_REAL="$(readlink -f "$EFFECTIVE_NODE" 2>/dev/null || true)"
EFFECTIVE_VERSION="$(env PATH="$SERVICE_PATH" node -v 2>/dev/null || true)"

if [[ "$EFFECTIVE_NODE_REAL" == "$NODE_BIN" && "$EFFECTIVE_VERSION" == v24.* ]]; then
  echo "OK gateway $PROFILE usa efetivamente $EFFECTIVE_NODE_REAL ($EFFECTIVE_VERSION)"
  echo "node_dir=$NODE_DIR"
  echo "dropin=$DROPIN"
else
  echo "gateway não resolveu o Node 24 esperado" >&2
  echo "esperado=$NODE_BIN ($NODE_VERSION)" >&2
  echo "efetivo=${EFFECTIVE_NODE_REAL:-ausente} (${EFFECTIVE_VERSION:-ausente})" >&2
  exit 14
fi
