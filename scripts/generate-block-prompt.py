#!/usr/bin/env python3
"""Gera prompts para blocos de 25 candidatos para o agy (Antigravity).

Uso: python3 scripts/generate-block-prompt.py <block_index>
Saída: prompt no stdout + arquivos em .orchestrator/runtime/blocks/
"""

import json
import os
import sys
from pathlib import Path

BLOCK_SIZE = 25
BLOCKS_DIR = Path(".orchestrator/runtime/blocks")


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 generate-block-prompt.py <block_index>", file=sys.stderr)
        sys.exit(1)

    block_index = int(sys.argv[1])
    candidates_path = Path("data/public-candidates.json")

    with open(candidates_path, encoding="utf-8") as f:
        candidates = json.load(f)

    total = len(candidates)
    total_blocks = (total + BLOCK_SIZE - 1) // BLOCK_SIZE

    if block_index < 0 or block_index >= total_blocks:
        print(
            f"Bloco {block_index} inexistente. Total de blocos: {total_blocks} "
            f"(blocos válidos: 0..{total_blocks - 1})",
            file=sys.stderr,
        )
        sys.exit(1)

    start = block_index * BLOCK_SIZE
    end = min(start + BLOCK_SIZE, total)
    block = candidates[start:end]

    BLOCKS_DIR.mkdir(parents=True, exist_ok=True)

    json_path = BLOCKS_DIR / f"block-{block_index}-candidates.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(block, f, indent=2, ensure_ascii=False)
        f.write("\n")

    prompt_lines: list[str] = [
        "Analise estes 25 candidatos da eleição 2026 no Rio Grande do Sul.",
        "Para cada candidato, procure na internet (TSE, Google notícias, sites de veículos,",
        "perfis oficiais, Wikipedia, Diário Oficial) e gere:",
        "",
        "1. HISTÓRICO POLÍTICO: cargos anteriores, mandatos, atuação política relevante",
        "2. PLATAFORMA: principais propostas, posicionamentos, projetos de lei",
        "3. REPUTAÇÃO: notícias relevantes sobre conduta, processos, atuações controversas",
        "4. ESTRUTURIO: participação em votações, posição em comissões (se disponível)",
        "",
        "Formato de saída: JSON com array de objetos, cada um com:",
        "  - slug (string, exatamente igual ao entrada)",
        "  - full_name (string)",
        "  - party (string, exatamente igual ao entrada)",
        "  - position (string: 'deputado_federal','deputado_estadual','governador','vice_governador','senador','presidente')",
        "  - claims: array de objetos claim, cada um com:",
        "    - type: 'historico_politico' | 'plataforma' | 'reputacao' | 'estruturio'",
        "    - claim: string com o texto do claim",
        "    - source: URL ou descrição da fonte",
        "    - confidence: número 1-5 (1=speculativo, 5=documentado oficial)",
        "",
        "IMPORTANTE:",
        "- Cada claim deve ser concreto e verificável.",
        "- Se não encontrar informação sobre alguma categoria, omita (não gere claim vazio).",
        "- Mantenha o JSON válido (escapamento de caracteres especiais).",
        f"- Bloco {block_index + 1} de {total_blocks} ({len(block)} candidatos).",
        "- Para candidatos com pouquíssima informação pública, apenas gere claims de 'historico_politico'",
        "  com o mínimo de contexto TSE e plataforma com o básico do partido.",
        "- Use pesquisa web se disponível; se não, faça inferência com fontes oficiais TSE do dataset.",
        "",
        "CANDIDATOS:",
    ]

    for c in block:
        prompt_lines.append(f"  - slug: {c['slug']!r}")
        prompt_lines.append(f"    nome: {c['full_name']!r}")
        prompt_lines.append(f"    partido: {c['party']!r}")
        prompt_lines.append(f"    cargo: {c['position_label']!r}")
        prompt_lines.append(f"    número: {c['ballot_number']!r}")
        prompt_lines.append(f"    TSE_ID: {c['tse_candidate_id']!r}")
        prompt_lines.append(f"    status_cadastro: {c.get('registration_status', 'N/A')!r}")
        prompt_lines.append("")

    prompt_content = "\n".join(prompt_lines) + "\n"

    # Salva também o prompt para referência
    prompt_path = BLOCKS_DIR / f"block-{block_index}-prompt.txt"
    with open(prompt_path, "w", encoding="utf-8") as f:
        f.write(prompt_content)

    print(prompt_content, end="")


if __name__ == "__main__":
    main()
