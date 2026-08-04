#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"

command -v node >/dev/null || { echo "Node.js est requis"; exit 1; }
command -v pnpm >/dev/null || { echo "Activez pnpm avec: corepack enable"; exit 1; }

pnpm install
if [[ ! -f .env ]]; then cp .env.example .env; fi
echo "Prêt. Lancez: pnpm mobile"
