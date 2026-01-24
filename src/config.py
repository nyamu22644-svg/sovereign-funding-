import os

from dotenv import load_dotenv

load_dotenv()

DERIV_APP_ID = os.getenv("DERIV_APP_ID")
DERIV_API_TOKEN = os.getenv("DERIV_API_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not DERIV_APP_ID:
    raise ValueError("Missing DERIV_APP_ID in .env. Set DERIV_APP_ID to your Deriv app id.")

try:
    DERIV_APP_ID = int(DERIV_APP_ID)
except (TypeError, ValueError):
    raise ValueError("DERIV_APP_ID must be set to an integer in .env.")

if not DERIV_API_TOKEN or DERIV_API_TOKEN == "REPLACE_ME":
    raise ValueError("Missing DERIV_API_TOKEN in .env. Set DERIV_API_TOKEN to a valid Deriv API token.")

if not SUPABASE_URL:
    raise ValueError("Missing SUPABASE_URL in .env. Set SUPABASE_URL to your Supabase project URL.")

if not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_SERVICE_KEY in .env. Set SUPABASE_SERVICE_KEY to your Supabase service role key.")
