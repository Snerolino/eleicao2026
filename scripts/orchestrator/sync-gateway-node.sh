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

cat >"$DROPIN" <<EOF
[Service]
Environment="PATH=$HERMES_AGENT_HOME/venv/bin:$HERMES_AGENT_HOME/node_modules/.bin:$NODE_DIR:$REAL_HOME/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
EOF

systemctl --user daemon-reload
hermes -p "$PROFILE" gateway restart >/dev/null

ENV_LINE="$(systemctl --user show "$SERVICE" -p Environment --value)"
if [[ "$ENV_LINE" == *"$NODE_DIR"* ]]; then
  echo "OK gateway $PROFILE sincronizado com $NODE_VERSION"
  echo "node_dir=$NODE_DIR"
  echo "dropin=$DROPIN"
else
  echo "gateway reiniciou, mas PATH efetivo não contém $NODE_DIR" >&2
  exit 13
fi
