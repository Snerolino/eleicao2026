#!/bin/bash
# Create Cloudflare API token for Pages CI/CD
OAUTH="cfoat_T8mwsR42lj-DiOoJlb4yiuaF3JyfeREApCjgDpKGjBQ.VO76xEUMf1HoWTDheYlhn7YFVvs9Jx26y10QkEYAll4"
ACCT="effd7c10cee61d0c19fea7cc1fe8dc93"

# First, list permission groups to find Pages:Edit group
echo "=== Listing permission groups ==="
curl -s -H "Authorization: Bearer $OAUTH" \
  "https://api.cloudflare.com/client/v4/permission_groups" \
  | python3 -c "
import sys,json
d = json.load(sys.stdin)
if d.get('success'):
    for g in d['result']:
        name = g.get('name','').lower()
        if 'page' in name or 'cloudflare' in name:
            print(f\"{g['id']} -> {g['name']}\")
    # Also find relevant ones
    for g in d['result']:
        name = g.get('name','')
        if 'Pages' in name:
            print(f\"FOUND: {g['id']} -> {g['name']}\")
else:
    print(json.dumps(d, indent=2))
" 2>&1