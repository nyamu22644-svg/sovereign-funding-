import asyncio
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import json

from colorama import Fore, Style
from deriv_api import DerivAPI
from supabase import create_client, Client

from src import config

# Initialize Supabase client (uses service-role key for full RLS bypass)
supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)


def fetch_deriv_users():
    """
    Fetch active Deriv users from user_accounts table.
    Query: broker_type='deriv' AND is_active=true AND deriv_api_token IS NOT NULL
    """
    try:
        response = (
            supabase.table("user_accounts")
            .select("*")
            .eq("broker_type", "deriv")
            .eq("is_active", True)
            .not_.is_("deriv_api_token", "null")
            .execute()
        )
        return response.data if response.data else []
    except Exception as e:
        print(f"{Fore.RED}⚠ Failed to fetch Deriv users: {e}{Style.RESET_ALL}")
        return []


def get_daily_pnl(user_email: str) -> float:
    """Calculate daily P&L from profit_table for today."""
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        response = supabase.table("profit_table").select("profit").eq("user_email", user_email).gte("created_at", today_start.isoformat()).execute()
        
        if response.data:
            total_pnl = sum(float(row.get("profit", 0)) for row in response.data)
            return total_pnl
        return 0.0
    except Exception as e:
        print(f"{Fore.YELLOW}[{user_email}] ⚠ Failed to calculate daily P&L: {e}{Style.RESET_ALL}")
        return 0.0


def get_deriv_token(user: dict) -> str:
    """
    Extract Deriv API token from user record.
    Priority: broker_credentials.token > deriv_api_token
    """
    # Try broker_credentials.token first
    credentials = user.get("broker_credentials")
    if credentials:
        if isinstance(credentials, str):
            try:
                credentials = json.loads(credentials)
            except:
                credentials = {}
        token = credentials.get("token")
        if token:
            return token
    
    # Fallback to deriv_api_token
    return user.get("deriv_api_token", "")


async def get_open_positions_value(api, user_email: str) -> float:
    """Get unrealized P&L from open positions."""
    try:
        portfolio = await api.portfolio(contract_type=["CALL", "PUT", "MULTUP", "MULTDOWN"])
        positions = portfolio.get("portfolio", {}).get("contracts", [])
        
        if not positions:
            return 0.0
        
        total_unrealized = 0.0
        for pos in positions:
            buy_price = float(pos.get("buy_price", 0))
            current_value = float(pos.get("bid_price", 0))
            total_unrealized += current_value - buy_price
        
        return total_unrealized
    except:
        return 0.0


def evaluate_challenge(user: dict, equity: float) -> tuple[str, str]:
    """
    Evaluate if user has breached or passed their challenge.
    Returns (status, reason)
    """
    account_size = float(user.get("account_size", 0))
    max_drawdown_limit = float(user.get("max_drawdown_limit", 0))
    profit_target = float(user.get("profit_target", 0))
    current_status = user.get("challenge_status", "active")
    
    # Skip if already breached or passed
    if current_status in ["breached", "passed"]:
        return current_status, "Already evaluated"
    
    # Skip if no challenge parameters set
    if account_size == 0:
        return "active", "No challenge parameters"
    
    # Calculate thresholds
    breach_threshold = account_size - max_drawdown_limit
    pass_threshold = account_size + profit_target
    
    # BREACH CHECK: equity dropped below allowed drawdown
    if equity < breach_threshold:
        return "breached", f"Equity ${equity:.2f} < Breach Level ${breach_threshold:.2f}"
    
    # PASS CHECK: equity reached profit target
    if equity >= pass_threshold:
        return "passed", f"Equity ${equity:.2f} >= Target ${pass_threshold:.2f}"
    
    # Still active
    return "active", f"Equity ${equity:.2f} (Breach: ${breach_threshold:.2f}, Target: ${pass_threshold:.2f})"


async def check_single_trader(user: dict):
    """Check a single trader's Deriv account and evaluate their challenge."""
    user_email = user.get("user_email")
    deriv_token = get_deriv_token(user)
    
    if not deriv_token:
        print(f"{Fore.RED}[{user_email}] ⚠ No Deriv token found{Style.RESET_ALL}")
        return False
    
    try:
        token_suffix = deriv_token[-4:]
        print(f"{Fore.YELLOW}[{user_email}] Connecting with token ...{token_suffix}{Style.RESET_ALL}")

        api = DerivAPI(app_id=config.DERIV_APP_ID)
        auth_response = await api.authorize(deriv_token)
        
        # DEBUG: Check account details
        auth_data = auth_response.get("authorize", {})
        account_id = auth_data.get("loginid")
        is_virtual = auth_data.get("is_virtual") == 1
        account_type = "DEMO" if is_virtual else "REAL"
        
        print(f"{Fore.GREEN}[{user_email}] ✔ Auth Success! ({account_type} Account: {account_id}){Style.RESET_ALL}")

        # Extract and update Deriv account ID if changed
        try:
            if account_id:
                supabase.table("user_accounts").update({
                    "deriv_account_id": account_id
                }).eq("user_email", user_email).execute()
        except:
            pass

        # Get balance
        balance_data = await api.balance()
        balance_info = balance_data.get("balance") if isinstance(balance_data, dict) else {}
        balance = float(balance_info.get("balance", 0))
        currency = balance_info.get("currency", "USD")

        # --- AUTO-DISCOVERY LOGIC ---
        account_size = float(user.get("account_size", 0))
        if account_size == 0 and balance > 0:
            print(f"{Fore.MAGENTA}[{user_email}] ⚡ Auto-initializing challenge: Size ${balance}{Style.RESET_ALL}")
            account_size = balance
            # Set sensible defaults: 10% drawdown, 10% profit target
            max_drawdown = balance * 0.10
            profit_target = balance * 0.10
            
            try:
                supabase.table("user_accounts").update({
                    "account_size": account_size,
                    "max_drawdown_limit": max_drawdown,
                    "profit_target": profit_target
                }).eq("user_email", user_email).execute()
                # Update local dictionary so evaluation works immediately
                user["account_size"] = account_size
                user["max_drawdown_limit"] = max_drawdown
                user["profit_target"] = profit_target
            except Exception as e:
                print(f"{Fore.RED}⚠ Failed to auto-set parameters: {e}{Style.RESET_ALL}")
        # -----------------------------

        # Get unrealized P&L from open positions
        unrealized_pnl = await get_open_positions_value(api, user_email)
        
        # Calculate equity = balance + unrealized P&L
        equity = balance + unrealized_pnl
        
        # Get daily P&L from profit_table
        daily_pnl = get_daily_pnl(user_email)

        print(f"{Fore.CYAN}[{user_email}] Balance: ${balance:.2f} | Unrealized: ${unrealized_pnl:.2f} | Equity: ${equity:.2f} | Daily P&L: ${daily_pnl:.2f}{Style.RESET_ALL}")

        # Evaluate challenge status
        new_status, reason = evaluate_challenge(user, equity)
        
        # Print status with color
        if new_status == "breached":
            print(f"{Fore.RED}{Style.BRIGHT}[{user_email}] ❌ BREACHED: {reason}{Style.RESET_ALL}")
        elif new_status == "passed":
            print(f"{Fore.GREEN}{Style.BRIGHT}[{user_email}] 🏆 PASSED: {reason}{Style.RESET_ALL}")
        else:
            print(f"{Fore.BLUE}[{user_email}] ✅ Active: {reason}{Style.RESET_ALL}")

        # Persist to trading_states
        current_time = datetime.now(timezone.utc).isoformat()
        try:
            sync_data = {
                "user_email": user_email,
                "balance": balance,
                "equity": equity,
                "daily_pnl": daily_pnl,
                "currency": currency,
                "status": new_status,
                "last_trade_at": current_time,
                "updated_at": current_time
            }

            supabase.table("trading_states").upsert(
                sync_data,
                on_conflict="user_email"
            ).execute()
            print(f"{Fore.CYAN}[{user_email}] ✔ trading_states updated{Style.RESET_ALL}")
        except Exception as db_error:
            print(f"{Fore.YELLOW}[{user_email}] ⚠ trading_states sync failed: {db_error}{Style.RESET_ALL}")

        # Update challenge_status in user_accounts ONLY (preserve locked_at, evaluation_started_at)
        if new_status != user.get("challenge_status"):
            try:
                supabase.table("user_accounts").update({
                    "challenge_status": new_status
                }).eq("user_email", user_email).execute()
                
                if new_status in ["breached", "passed"]:
                    print(f"{Fore.MAGENTA}[{user_email}] 📧 Status → {new_status.upper()}{Style.RESET_ALL}")
            except Exception as e:
                print(f"{Fore.YELLOW}[{user_email}] ⚠ challenge_status update failed: {e}{Style.RESET_ALL}")

        await api.disconnect()
        return True

    except Exception as e:
        print(f"{Fore.RED}{Style.BRIGHT}[{user_email}] ❌ FAILED: {e}{Style.RESET_ALL}")
        # Mark user as error in trading_states
        try:
            supabase.table("trading_states").upsert(
                {"user_email": user_email, "status": "error", "updated_at": datetime.now(timezone.utc).isoformat()},
                on_conflict="user_email"
            ).execute()
        except:
            pass
        return False


async def check_all_traders():
    """Fetch all Deriv users and evaluate each one."""
    users = fetch_deriv_users()
    
    if not users:
        print(f"{Fore.YELLOW}⚠ No active Deriv users found (broker_type='deriv', is_active=true, token present){Style.RESET_ALL}")
        return
    
    print(f"{Fore.BLUE}Found {len(users)} active Deriv user(s) to evaluate{Style.RESET_ALL}\n")
    
    results = {"success": 0, "breached": 0, "passed": 0, "error": 0}
    
    for user in users:
        success = await check_single_trader(user)
        if success:
            results["success"] += 1
            new_status = user.get("challenge_status", "active")
            if new_status == "breached":
                results["breached"] += 1
            elif new_status == "passed":
                results["passed"] += 1
        else:
            results["error"] += 1
        print()
    
    print(f"{Fore.GREEN}{Style.BRIGHT}Summary: {results['success']}/{len(users)} synced | Breached: {results['breached']} | Passed: {results['passed']} | Errors: {results['error']}{Style.RESET_ALL}")
