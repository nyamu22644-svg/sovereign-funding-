"""
Base Broker Adapter Interface

All broker adapters must implement this interface to provide
a unified way to fetch account state from different brokers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class AccountState:
    """Unified account state returned by all adapters."""
    balance: float
    equity: float
    currency: str
    unrealized_pnl: float
    daily_pnl: float
    last_trade_at: Optional[datetime]
    account_id: Optional[str] = None
    error: Optional[str] = None
    
    @property
    def is_valid(self) -> bool:
        """Check if account state was fetched successfully."""
        return self.error is None


class BrokerAdapter(ABC):
    """
    Abstract base class for broker adapters.
    
    Each broker adapter must implement:
    - connect(): Establish connection to broker
    - fetch_account_state(): Get current balance, equity, P&L
    - disconnect(): Close connection
    """
    
    def __init__(self, credentials: dict, app_config: dict = None):
        """
        Initialize adapter with broker credentials.
        
        Args:
            credentials: Broker-specific credentials (token, login, server, etc.)
            app_config: Optional app-level config (API keys, endpoints)
        """
        self.credentials = credentials
        self.app_config = app_config or {}
        self.connected = False
        self.account_id = None
    
    @property
    @abstractmethod
    def broker_name(self) -> str:
        """Return the broker name for logging."""
        pass
    
    @abstractmethod
    async def connect(self) -> bool:
        """
        Establish connection to the broker.
        
        Returns:
            True if connection successful, False otherwise.
        """
        pass
    
    @abstractmethod
    async def fetch_account_state(self) -> AccountState:
        """
        Fetch current account state from broker.
        
        Returns:
            AccountState with balance, equity, P&L, etc.
        """
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to the broker."""
        pass
    
    async def __aenter__(self):
        """Async context manager entry."""
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.disconnect()
