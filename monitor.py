"""Simple web dashboard to monitor trading engine."""
from flask import Flask, render_template_string
from supabase import create_client
from datetime import datetime, timezone
from src import config

app = Flask(__name__)

# Initialize Supabase
supabase = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Syntax Engine Monitor</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status-active { color: blue; }
        .status-breached { color: red; font-weight: bold; }
        .status-passed { color: green; font-weight: bold; }
        .status-error { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .refresh { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <h1>🔥 Syntax Engine Monitor</h1>
    <p class="refresh">Auto-refreshes every 30 seconds | Last update: {{ timestamp }}</p>

    <h2>Trading States</h2>
    <table>
        <tr>
            <th>User Email</th>
            <th>Balance</th>
            <th>Equity</th>
            <th>Daily P&L</th>
            <th>Status</th>
            <th>Last Trade</th>
        </tr>
        {% for trader in traders %}
        <tr class="status-{{ trader.status.lower() }}">
            <td>{{ trader.user_email }}</td>
            <td>${{ "%.2f"|format(trader.balance) }}</td>
            <td>${{ "%.2f"|format(trader.equity) }}</td>
            <td>${{ "%.2f"|format(trader.daily_pnl) }}</td>
            <td>{{ trader.status.upper() }}</td>
            <td>{{ trader.last_trade_at[:19] if trader.last_trade_at else 'Never' }}</td>
        </tr>
        {% endfor %}
    </table>

    {% if not traders %}
    <p>No trading data available.</p>
    {% endif %}

    <h2>User Accounts</h2>
    <table>
        <tr>
            <th>User Email</th>
            <th>Broker</th>
            <th>Account Size</th>
            <th>Drawdown Limit</th>
            <th>Profit Target</th>
            <th>Challenge Status</th>
        </tr>
        {% for user in users %}
        <tr>
            <td>{{ user.user_email }}</td>
            <td>{{ user.broker_type.upper() }}</td>
            <td>${{ "%.2f"|format(user.account_size) if user.account_size else 'N/A' }}</td>
            <td>${{ "%.2f"|format(user.max_drawdown_limit) if user.max_drawdown_limit else 'N/A' }}</td>
            <td>${{ "%.2f"|format(user.profit_target) if user.profit_target else 'N/A' }}</td>
            <td>{{ user.challenge_status.upper() if user.challenge_status else 'ACTIVE' }}</td>
        </tr>
        {% endfor %}
    </table>
</body>
</html>
"""

@app.route('/')
def dashboard():
    try:
        # Get trading states
        trading_response = supabase.table("trading_states").select("*").execute()
        traders = trading_response.data or []

        # Get user accounts
        users_response = supabase.table("user_accounts").select("user_email, broker_type, account_size, max_drawdown_limit, profit_target, challenge_status").execute()
        users = users_response.data or []

        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')

        return render_template_string(HTML_TEMPLATE, traders=traders, users=users, timestamp=timestamp)
    except Exception as e:
        return f"<h1>Error loading dashboard: {e}</h1>"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)