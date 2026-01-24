from datetime import datetime, timezone
from typing import Optional
import aiohttp

from .base import BaseAdapter, AccountState


class MT4Adapter(BaseAdapter):
    """
    Adapter for MetaTrader 4 accounts.
    
    MT4 has no official public API. This adapter supports:
    1. EA/Trade Copier bridge: Your EA posts data to an endpoint, we read from it
    2. Manager API: Requires broker cooperation (not implemented here)
    3. Third-party bridge services (e.g., MT4 to REST bridge)
    
    Credentials should contain:
    - bridge_url: URL of the bridge service endpoint
    - account_id: MT4 account number
    - bridge_token: Authentication token for the bridge (optional)
    """
    
    broker_type = "mt4"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
    
    def validate_credentials(self, credentials: dict) -> tuple[bool, str]:
        """Validate MT4 bridge credentials."""
        if not credentials.get("bridge_url"):
            return False, "Missing 'bridge_url' in broker_credentials"
        if not credentials.get("account_id"):
            return False, "Missing 'account_id' in broker_credentials"
        return True, ""
    
    async def connect(self, credentials: dict) -> bool:
        """Initialize HTTP session for bridge communication."""
        try:
            self.session = aiohttp.ClientSession()
            return True
        except Exception:
            return False
    
    async def fetch_account_state(self, credentials: dict) -> AccountState:
        """
        Fetch account state from MT4 bridge.
        
        Expected bridge response format:
        {
            "balance": 10000.00,
            "equity": 10250.50,
            "currency": "USD",
            "margin": 500.00,
            "free_margin": 9750.50,
            "profit": 250.50,
            "account_id": "12345678"
        }
        """
        try:
            bridge_url = credentials.get("bridge_url")
            account_id = credentials.get("account_id")
            bridge_token = credentials.get("bridge_token", "")
            
            if self.session is None:
                self.session = aiohttp.ClientSession()
            
            headers = {}
            if bridge_token:
                headers["Authorization"] = f"Bearer {bridge_token}"
            
            # Fetch from bridge endpoint
            url = f"{bridge_url.rstrip('/')}/account/{account_id}"
            
            async with self.session.get(url, headers=headers, timeout=10) as response:
                if response.status != 200:
                    return AccountState(
                        balance=0,
                        equity=0,
                        currency="USD",
                        error=f"Bridge returned status {response.status}"
                    )
                
                data = await response.json()
                
                balance = float(data.get("balance", 0))
                equity = float(data.get("equity", balance))
                currency = data.get("currency", "USD")
                unrealized_pnl = float(data.get("profit", 0))
                
                return AccountState(
                    balance=balance,
                    equity=equity,
                    currency=currency,
                    unrealized_pnl=unrealized_pnl,
                    account_id=str(account_id),
                    last_trade_at=datetime.now(timezone.utc)
                )
                
        except aiohttp.ClientError as e:
            return AccountState(
                balance=0,
                equity=0,
                currency="USD",
                error=f"Bridge connection failed: {e}"
            )
        except Exception as e:
            return AccountState(
                balance=0,
                equity=0,
                currency="USD",
                error=str(e)
            )
    
    async def disconnect(self) -> None:
        """Close HTTP session."""
        if self.session:
            await self.session.close()
            self.session = None
