# Sovereign Funding - Complete Trading Platform

A full-stack trading evaluation platform with payment integration and real-time account monitoring.

## 🚀 Project Overview

This monorepo contains:
- **Frontend**: Vite + React - Modern UI for account tier selection and payment
- **Backend**: Express.js - Payment processing with IntaSend API
- **Engine**: Python - Real-time trading evaluation engine for prop firms

## 📋 Prerequisites

- Node.js (v18+) for frontend/backend
- Python 3.8+ for engine
- npm/yarn
- IntaSend API keys
- Supabase account

## 🔧 Installation

### Clone the Repository
```bash
git clone https://github.com/nyamu22644-svg/sovereign-funding-.git
cd sovereign-funding
```

### Frontend Setup
```bash
npm install
```

### Backend Setup
```bash
cd server
npm install
cd ..
```

### Engine Setup
```bash
cd src  # Engine is in src/ directory
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cd ..
```

## ⚙️ Configuration

### Environment Variables

**Root directory** - `.env.local` (Frontend):
```env
GEMINI_API_KEY=your_gemini_api_key_here
INTASEND_PUBLISHABLE_KEY=your_intasend_publishable_key
INTASEND_SECRET_KEY=your_intasend_secret_key
```

**Server directory** - `server/.env` (Backend):
```env
INTASEND_PUBLISHABLE_KEY=your_intasend_publishable_key
INTASEND_SECRET_KEY=your_intasend_secret_key
PORT=3001
```

**Engine directory** - `src/.env` (Engine):
```env
DERIV_APP_ID=your_app_id
DERIV_API_TOKEN=your_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

## 🏃 Running the Application

### Start Frontend
```bash
npm run dev
```
Runs on: `http://localhost:3000`

### Start Backend
```bash
cd server
npm run dev
```
Runs on: `http://localhost:3001`

### Start Engine
```bash
cd src
python main.py
```

## 📁 Project Structure

```
sovereign-funding/
├── components/              # React components (Frontend)
│   ├── Evaluation.tsx      # Account tier selection
│   ├── Button.tsx
│   └── ...
├── server/                 # Express backend
│   ├── index.js           # IntaSend payment integration
│   └── ...
├── src/                    # Python engine
│   ├── main.py            # Engine entry point
│   ├── referee.py         # Evaluation logic
│   ├── adapters/          # Broker adapters
│   ├── config.py
│   ├── requirements.txt
│   └── ...
├── .env.local             # Frontend env vars
├── README.md              # This file
└── ...
```

## 💳 Payment Flow

1. User selects account tier → Frontend sends to backend
2. Backend creates IntaSend payment intent
3. User completes payment → Account funded
4. Engine monitors trading performance in real-time

## 🔍 Engine Features

- **Multi-Broker Support**: Deriv, MT4, MT5, cTrader, etc.
- **Real-Time Monitoring**: 30-second evaluation cycles
- **Challenge Evaluation**: Breach/pass detection
- **Supabase Integration**: Live data sync
- **Auto-Discovery**: Sets parameters from balance

## 🗄️ Database Schema

See `src/supabase_schema.sql` for required tables:
- `user_accounts`: Trader info and challenge settings
- `trading_states`: Live balance and status
- `profit_table`: P&L tracking

## 🔐 Security

- Never commit `.env` files
- Use service-role keys for Supabase
- Rotate API tokens regularly
- Secret keys server-side only

## 🚀 Deployment

### Frontend
```bash
npm run build
```
Deploy `dist/` folder.

### Backend
Deploy `server/` with environment variables.

### Engine
Deploy `src/` with Python environment and `.env`.

## 📝 Development

- Frontend: Hot-reload with Vite
- Backend: Auto-reload with `npm run dev`
- Engine: Edit Python files, restart as needed

## 🤝 Support

- IntaSend: https://intasend.com/docs
- Supabase: https://supabase.com/docs
- Deriv API: https://developers.deriv.com
