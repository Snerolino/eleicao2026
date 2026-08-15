#!/usr/bin/env python3
import requests, json
env = {}
for l in open('/home/lourenco/Projetos/raspador-candidados-2026/.env'):
    if '=' in l:
        k,v = l.strip().split('=', 1)
        env[k.strip()] = v.strip()
url = env['SUPABASE_URL']
key = env['SUPABASE_SECRET_KEY']
headers = {'Authorization': f'Bearer {key}', 'apikey': key, 'Content-Type': 'application/json'}
r = requests.get(f'{url}/rest/v1/claims?select=status&limit=500', headers=headers)
claims = r.json()
counts = {}
for c in claims:
    s = c.get('status', 'unknown')
    counts[s] = counts.get(s, 0) + 1
print(json.dumps(counts, indent=2))
if len(claims) >= 499:
    offset = 499
    while True:
        r2 = requests.get(f'{url}/rest/v1/claims?select=status&limit=500&offset={offset}', headers=headers)
        batch = r2.json()
        if not batch: break
        for c in batch:
            s = c.get('status', 'unknown')
            counts[s] = counts.get(s, 0) + 1
        offset += 500
        if len(batch) < 500: break
    print(json.dumps(counts, indent=2))
else:
    print(f"Total returned: {len(claims)}")