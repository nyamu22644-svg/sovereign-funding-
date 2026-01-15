import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import IntaSend from 'intasend-node';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true
}));
app.use(express.json());

// Initialize IntaSend
console.log('Initializing IntaSend with:');
console.log('Publishable Key:', process.env.INTASEND_PUBLISHABLE_KEY?.substring(0, 20) + '...');
console.log('Secret Key:', process.env.INTASEND_SECRET_KEY?.substring(0, 20) + '...');

const intasend = new IntaSend({
  publishableKey: process.env.INTASEND_PUBLISHABLE_KEY,
  secretKey: process.env.INTASEND_SECRET_KEY,
  test: true
});

console.log('IntaSend initialized');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Create Payment Intent Endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, email } = req.body;

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and currency' 
      });
    }

    const amountInt = parseInt(amount);
    console.log('Creating charge with:', { amount: amountInt, currency, email });

    // Try the charge API with proper format
    // IntaSend expects amount as a number (in the smallest currency unit)
    const chargePayload = {
      amount: amountInt,
      currency: currency,
      email: email || 'test@example.com',
      phone_number: '+1234567890', // IntaSend may require phone
      first_name: 'Test',
      last_name: 'User',
      redirect_url: 'http://localhost:3000/payment-success'
    };
    
    console.log('Charge payload:', JSON.stringify(chargePayload));

    const charge = await intasend.collection().charge(chargePayload);

    console.log('IntaSend response:', JSON.stringify(charge, null, 2));

    // Return the full response including checkout URL
    return res.status(200).json({
      ...charge,
      url: charge.checkout_url || charge.url || charge.redirect_url
    });
  } catch (error) {
    let errorMessage = 'Unknown error';
    
    // Handle Buffer responses from IntaSend
    if (Buffer.isBuffer(error)) {
      try {
        const errorObj = JSON.parse(error.toString());
        console.log('Parsed error object:', errorObj);
        errorMessage = errorObj.errors?.[0]?.detail || errorObj.message || error.toString();
      } catch (e) {
        errorMessage = error.toString();
      }
    } else if (error?.message) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    
    console.error('IntaSend charge error:', errorMessage);
    return res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: errorMessage
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 Secure backend running on http://localhost:${PORT}`);
  console.log(`📡 Payment API endpoint: POST http://localhost:${PORT}/api/create-payment-intent`);
});
