#!/usr/bin/env bash
set -euo pipefail

# Inicia o login oficial do GitHub CLI sem expor tokens ou PINs.
# Execute no terminal interativo, não dentro de CI.

if ! command -v gh >/dev/null 2>&1; then
  printf '%s\n' 'Erro: GitHub CLI (gh) não está instalado.' >&2
  exit 1
fi

printf '%s\n' 'Iniciando autenticação oficial do GitHub...'
printf '%s\n' 'O gh exibirá a URL e o código do dispositivo. Não envie esse código pelo chat.'
printf '%s\n' ''

env -u GH_TOKEN -u GITHUB_TOKEN gh auth login \
  --hostname github.com \
  --git-protocol https \
  --web

env -u GH_TOKEN -u GITHUB_TOKEN gh auth setup-git

env -u GH_TOKEN -u GITHUB_TOKEN gh auth status

env -u GH_TOKEN -u GITHUB_TOKEN git ls-remote origin HEAD >/dev/null

printf '%s\n' ''
printf '%s\n' 'GitHub autenticado e acesso ao remoto confirmado.'
