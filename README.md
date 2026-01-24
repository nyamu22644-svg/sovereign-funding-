# Syntax Engine

A Python-based trading evaluation engine for prop trading firms. Monitors trader accounts across multiple brokers (Deriv, MT4, MT5, cTrader, etc.) and evaluates challenge performance in real-time.

## Features

- **Multi-Broker Support**: Adapter pattern for different trading platforms
- **Real-Time Monitoring**: 30-second evaluation cycles
- **Challenge Evaluation**: Breach/pass detection based on drawdown and profit targets
- **Supabase Integration**: Live sync of trading data and states
- **Auto-Discovery**: Automatically sets challenge parameters from account balance

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd syntax-engine
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables**
   Create a `.env` file with:
   ```
   DERIV_APP_ID=your_app_id
   DERIV_API_TOKEN=your_token
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

5. **Run the engine**
   ```bash
   python main.py
   ```

## Database Schema

See `supabase_schema.sql` for the required tables:
- `user_accounts`: Trader information and challenge settings
- `trading_states`: Live balance and evaluation status
- `profit_table`: Daily P&L tracking

## Security

- Never commit `.env` files or API keys
- Use service-role keys for Supabase RLS bypass
- Rotate API tokens regularly

## Architecture

- `main.py`: Entry point with asyncio loop
- `src/referee.py`: Core evaluation logic
- `src/adapters/`: Broker-specific implementations
- `src/config.py`: Environment configuration