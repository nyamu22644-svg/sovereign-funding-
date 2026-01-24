"""
Deriv Broker Adapter

Connects to Deriv API via WebSocket to fetch:
- Account balance
- Equity (balance + unrealized P&L from open positions)
- Account ID (loginid)
"""

from datetime import datetime, timezone
from deriv_api import DerivAPI

from .base import BrokerAdapter, AccountState
from src import config


class DerivAdapter(BrokerAdapter):
    """Adapter for Deriv broker using their WebSocket API."""
    
    def __init__(self, credentials: dict, app_config: dict = None):
        super().__init__(credentials, app_config)
        self.api = None
        self.token = credentials.get("deriv_api_token") or credentials.get("token")
        self.app_id = app_config.get("app_id") if app_config else config.DERIV_APP_ID
    
    @property
    def broker_name(self) -> str:
        return "Deriv"
    
    async def connect(self) -> bool:
        """Connect and authorize with Deriv API."""
        try:
            self.api = DerivAPI(app_id=self.app_id)
            auth_response = await self.api.authorize(self.token)
            
            # Extract account ID
            self.account_id = auth_response.get("authorize", {}).get("loginid")
            self.connected = True
            return True
        except Exception as e:
            self.connected = False
            raise ConnectionError(f"Deriv auth failed: {e}")
    
    async def fetch_account_state(self) -> AccountState:
        """Fetch balance, equity, and open positions from Deriv."""
        if not self.connected or not self.api:
            return AccountState(
                balance=0, equity=0, currency="USD",
                unrealized_pnl=0, daily_pnl=0, last_trade_at=None,
                error="Not connected"
            )
        
        try:
            # Get balance
            balance_data = await self.api.balance()
            balance_info = balance_data.get("balance", {})
            balance = float(balance_info.get("balance", 0))
            currency = balance_info.get("currency", "USD")
            
            # Get unrealized P&L from open positions
            unrealized_pnl = await self._get_unrealized_pnl()
            
            # Calculate equity
            equity = balance + unrealized_pnl
            
            return AccountState(
                balance=balance,
                equity=equity,
                currency=currency,
                unrealized_pnl=unrealized_pnl,
                daily_pnl=0.0,  # Calculated separately from profit_table
                last_trade_at=datetime.now(timezone.utc),
                account_id=self.account_id
            )
        except Exception as e:
            return AccountState(
                balance=0, equity=0, currency="USD",
                unrealized_pnl=0, daily_pnl=0, last_trade_at=None,
                error=str(e)
            )
    
    async def _get_unrealized_pnl(self) -> float:
        """Get unrealized P&L from open contracts."""
        try:
            # Try to get open positions
            portfolio = await self.api.portfolio(
                contract_type=["CALL", "PUT", "MULTUP", "MULTDOWN", "ASIANU", "ASIAND"]
            )
            contracts = portfolio.get("portfolio", {}).get("contracts", [])
            
            if not contracts:
                return 0.0
            
            total_unrealized = 0.0
            for contract in contracts:
                buy_price = float(contract.get("buy_price", 0))
                current_value = float(contract.get("bid_price", 0))
                total_unrealized += (current_value - buy_price)
            
            return total_unrealized
        except Exception:
            # Portfolio API may not be available for all accounts
            return 0.0
    
    async def disconnect(self) -> None:
        """Disconnect from Deriv API."""
        if self.api:
            try:
                await self.api.disconnect()
            except:
                pass
        self.connected = False
        self.api = None
