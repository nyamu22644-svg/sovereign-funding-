# Sovereign Funding - IntaSend Payment Integration

A modern web application for funding account evaluations with integrated IntaSend payment processing.

## 🚀 Project Overview

This project provides a complete payment solution with:
- **Frontend**: Vite + React - Modern, responsive UI for account tier selection
- **Backend**: Express.js - Secure payment processing with IntaSend API
- **Payment Integration**: IntaSend SDK for secure checkout handling

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- IntaSend API keys (Publishable & Secret)

## 🔧 Installation

### Clone the Repository
```bash
git clone https://github.com/nyamu22644-svg/sovereign-funding-.git
cd sovereign-funding
```

### Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

## ⚙️ Configuration

### Environment Variables

**Root directory** - `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
INTASEND_PUBLISHABLE_KEY=your_intasend_publishable_key
INTASEND_SECRET_KEY=your_intasend_secret_key
```

**Server directory** - `server/.env`:
```env
INTASEND_PUBLISHABLE_KEY=your_intasend_publishable_key
INTASEND_SECRET_KEY=your_intasend_secret_key
PORT=3001
```

## 🏃 Running the Application

### Start Frontend (Vite Dev Server)
```bash
npm run dev
```
Runs on: `http://localhost:3000`

### Start Backend (Express Server)
```bash
cd server
node index.js
```
Runs on: `http://localhost:3001`

Or use watch mode for development:
```bash
cd server
npm run dev
```

## 📁 Project Structure

```
sovereign-funding/
├── components/              # React components
│   ├── Evaluation.tsx      # Account tier selection with payment handler
│   ├── Button.tsx
│   ├── Dashboard.tsx
│   └── ...
├── server/                 # Express backend
│   ├── index.js           # Main server file with IntaSend integration
│   ├── .env               # Backend environment variables
│   └── package.json
├── index.tsx              # React entry point
├── .env.local             # Frontend environment variables
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 💳 Payment Flow

1. **User selects an account tier** on the Evaluation page
2. **Frontend sends tier data** to backend API
3. **Backend creates payment intent** using IntaSend SDK
4. **IntaSend returns checkout URL**
5. **User redirected to IntaSend checkout** for payment

### API Endpoint

**POST** `/api/create-payment-intent`

**Request Body:**
```json
{
  "amount": 299,
  "currency": "USD",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "url": "https://intasend.checkout.url",
  "checkout_url": "https://intasend.checkout.url",
  ...
}
```

## 🔐 Security Notes

- Secret keys are stored server-side only in `server/.env`
- Frontend never has access to secret keys
- All API calls go through the secure backend proxy
- Environment variables are NOT committed to version control

## 📦 Dependencies

### Frontend
- React 19.2.3
- Vite 6.4.1
- TypeScript 5.8.2

### Backend
- Express 4.18.2
- CORS 2.8.5
- dotenv 16.3.1
- intasend-node 1.1.2

## 🐛 Troubleshooting

### IntaSend API Errors
If you encounter `500 Internal Server Error` from IntaSend:
1. Verify API keys in `server/.env`
2. Check that keys have correct permissions
3. Ensure test mode is enabled (`test: true` in index.js)
4. Check backend console logs for detailed error messages

### Port Already in Use
If port 3001 is already in use:
```bash
# Windows
Get-NetTCPConnection -LocalPort 3001 | Stop-Process -Force

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

Then restart the server.

## 📝 Development

### Making Changes to Backend
- Edit `server/index.js`
- Server will auto-reload if using `npm run dev`
- Manually restart if using `node index.js`

### Making Changes to Frontend
- Edit React components in `components/`
- Changes hot-reload automatically via Vite

## 🚀 Deployment

To build for production:

```bash
npm run build
```

Deploy the `dist/` folder to your hosting service.

For backend, ensure:
- `server/` is deployed separately
- Environment variables are set on the server
- Port 3001 (or your chosen port) is accessible

## 📄 License

ISC

## 🤝 Support

For issues with IntaSend integration, visit: https://intasend.com/docs

