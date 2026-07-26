#!/bin/bash
# Create a Cloudflare API token for Pages CI/CD
set -e

OAUTH="cfoat_T8mwsR42lj-DiOoJlb4yiuaF3JyfeREApCjgDpKGjBQ.VO76xEUMf1HoWTDheYlhn7YFVvs9Jx26y10QkEYAll4"
ACCT="effd7c10cee61d0c19fea7cc1fe8dc93"

# Check what OAuth token can see about its own permissions
echo "=== Step 1: Check if OAuth can create tokens ==="
curl -s -H "Authorization: Bearer $OAUTH" \
  -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CI-CD-Portal-Transparencia-RS",
    "policies": [{
      "effect": "allow",
      "resources": {
        "com.cloudflare.api.account.zone.*": "*",
        "com.cloudflare.api.account.'"$ACCT"'": "*"
      },
      "permission_groups": [
        {"id": "c8fed203ed3043cba015a93ad1616f1f"},
        {"id": "82e64a83756745bbbb1c9c2701a816ba"}
      ]
    }]
  }' | python3 -m json.tool 2>&1