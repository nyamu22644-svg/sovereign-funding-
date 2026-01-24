"""Check user statuses."""
import os
from dotenv import load_dotenv
load_dotenv()
try:
    from supabase import create_client
    c = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])
    r = c.table('user_accounts').select('user_email, challenge_status, account_size, max_drawdown_limit, profit_target').execute()
    
    print("Current user statuses:")
    for user in r.data:
        email = user['user_email']
        status = user['challenge_status']
        size = user['account_size']
        drawdown = user['max_drawdown_limit']
        target = user['profit_target']
        print(f"{email}: status={status}, account_size={size}, drawdown={drawdown}, target={target}")
except Exception as e:
    print(f"Error: {e}")