"""
cTrader Broker Adapter

Connects to cTrader Open API to fetch account data.
Requires OAuth authentication and WebSocket/REST calls.

Documentation: https://help.ctrader.com/open-api/
"""

from datetime import datetime, timezone
from typing import Optional

from .base import BrokerAdapter, AccountState


class CTraderAdapter(BrokerAdapter):
    """
    Adapter for cTrader brokers using cTrader Open API.
    
    Required credentials:
    - client_id: OAuth client ID
    - client_secret: OAuth client secret  
    - access_token: User's OAuth access token
    - account_id: cTrader account ID
    
    Note: You need to register an application at https://openapi.ctrader.com/
    """
    
    def __init__(self, credentials: dict, app_config: dict = None):
        super().__init__(credentials, app_config)
        self.client_id = credentials.get("client_id")
        self.client_secret = credentials.get("client_secret")
        self.access_token = credentials.get("access_token")
        self.ctrader_account_id = credentials.get("account_id")
        self.ws = None
    
    @property
    def broker_name(self) -> str:
        return "cTrader"
    
    async def connect(self) -> bool:
        """
        Connect to cTrader Open API.
        
        TODO: Implement full OAuth flow and WebSocket connection:
        1. If no access_token, redirect to OAuth
        2. Connect to WebSocket: wss://live.ctraderapi.com:5035
        3. Authenticate with ProtoOAApplicationAuthReq
        4. Authorize account with ProtoOAAccountAuthReq
        """
        try:
            if not self.access_token:
                raise ConnectionError("Missing access_token. OAuth flow required.")
            
            if not self.ctrader_account_id:
                raise ConnectionError("Missing cTrader account_id.")
            
            # TODO: Implement WebSocket connection
            # from websockets import connect
            # self.ws = await connect("wss://live.ctraderapi.com:5035")
            # Send ProtoOAApplicationAuthReq
            # Send ProtoOAAccountAuthReq
            
            self.connected = True
            self.account_id = self.ctrader_account_id
            return True
            
        except Exception as e:
            self.connected = False
            raise ConnectionError(f"cTrader connection failed: {e}")
    
    async def fetch_account_state(self) -> AccountState:
        """
        Fetch account state from cTrader.
        
        TODO: Implement using cTrader Open API:
        - ProtoOATraderReq to get account info
        - ProtoOAReconcileReq to get positions
        - Calculate equity from balance + positions
        """
        if not self.connected:
            return AccountState(
                balance=0, equity=0, currency="USD",
                unrealized_pnl=0, daily_pnl=0, last_trade_at=None,
                error="Not connected to cTrader"
            )
        
        try:
            # TODO: Implement real API calls
            # Send ProtoOATraderReq
            # Parse response for balance, equity
            
            # Placeholder - return error until implemented
            return AccountState(
                balance=0, equity=0, currency="USD",
                unrealized_pnl=0, daily_pnl=0, last_trade_at=None,
                error="cTrader adapter not fully implemented yet"
            )
            
        except Exception as e:
            return AccountState(
                balance=0, equity=0, currency="USD",
                unrealized_pnl=0, daily_pnl=0, last_trade_at=None,
                error=str(e)
            )
    
    async def disconnect(self) -> None:
        """Disconnect from cTrader."""
        if self.ws:
            try:
                await self.ws.close()
            except:
                pass
        self.connected = False
        self.ws = None


# Helper for OAuth flow (to be called from frontend/API)
def get_ctrader_oauth_url(client_id: str, redirect_uri: str) -> str:
    """
    Generate cTrader OAuth authorization URL.
    
    User visits this URL, authorizes, gets redirected with code.
    """
    base_url = "https://openapi.ctrader.com/apps/auth"
    return f"{base_url}?client_id={client_id}&redirect_uri={redirect_uri}&scope=accounts"


async def exchange_ctrader_code(client_id: str, client_secret: str, code: str, redirect_uri: str) -> dict:
    """
    Exchange OAuth code for access token.
    
    Returns dict with access_token, refresh_token, expires_in.
    """
    import httpx
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openapi.ctrader.com/apps/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
            }
        )
        return response.json()
