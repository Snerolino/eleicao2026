#!/usr/bin/env python3
"""Verifica status dos claims no Supabase via service_role."""
import requests, json, os

env = {}
for l in open('/home/lourenco/Projetos/raspador-candidados-2026/.env'):
    if '=' in l:
        k, v = l.strip().split('=', 1)
        env[k.strip()] = v.strip().strip('"')

url = env.get('SUPABASE_URL', '').rstrip('/')
key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

if not url or not key:
    print("Credenciais não encontradas no .env")
    print("Chaves disponíveis:", list(env.keys()))
    exit(1)

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

# Contagem por status
resp = requests.get(f'{url}/rest/v1/claims?select=status',
                    headers=headers, timeout=15)
data = resp.json()
statuses = {}
for row in data:
    s = row.get('status', 'unknown')
    statuses[s] = statuses.get(s, 0) + 1
print("Claims por status:", json.dumps(statuses, indent=2))

# Total
resp2 = requests.get(f'{url}/rest/v1/claims?select=id',
                     headers=headers, timeout=15)
print("Total de claims:", len(resp2.json()))
