"""Quick script to debug user account data."""
import json
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

c = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])
r = c.table('user_accounts').select('*').eq('user_email', 'nyamuedwin5@gmail.com').execute()

print("=== Database record for nyamuedwin5@gmail.com ===")
print(json.dumps(r.data, indent=2))

# Also check what the API token returns
if r.data:
    token = r.data[0].get('deriv_api_token')
    if token:
        print(f"\nToken ends with: ...{token[-4:]}")
        print(f"account_size: {r.data[0].get('account_size')}")
        print(f"max_drawdown_limit: {r.data[0].get('max_drawdown_limit')}")
        print(f"profit_target: {r.data[0].get('profit_target')}")
