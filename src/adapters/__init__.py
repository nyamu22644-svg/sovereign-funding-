# Broker Adapters Package
from .base import BrokerAdapter, AccountState
from .deriv import DerivAdapter
from .ctrader import CTraderAdapter
from .mt4mt5 import MT4MT5Adapter
from .experimental import IQOptionAdapter, PocketOptionAdapter

ADAPTERS = {
    "deriv": DerivAdapter,
    "ctrader": CTraderAdapter,
    "mt4": MT4MT5Adapter,
    "mt5": MT4MT5Adapter,
    "iqoption": IQOptionAdapter,
    "pocket": PocketOptionAdapter,
}


def get_adapter(broker_type: str) -> type:
    """Get the adapter class for a broker type."""
    adapter_class = ADAPTERS.get(broker_type.lower())
    if not adapter_class:
        raise ValueError(f"Unsupported broker type: {broker_type}")
    return adapter_class
