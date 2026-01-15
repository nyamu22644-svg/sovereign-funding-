import { NextResponse } from 'next/server';
import { IntaSend } from 'intasend-node';

export async function POST() {
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
  const secretKey = process.env.INTASEND_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    return NextResponse.json({ error: 'IntaSend keys not configured' }, { status: 500 });
  }

  const intaSend = new IntaSend({ publishableKey, secretKey, test: true });

  try {
    const charge = await intaSend.collection().charge({
      amount: 499,
      currency: 'USD',
    });

    return NextResponse.json({ checkoutUrl: charge.checkout_url });
  } catch (error) {
    console.error('IntaSend charge error', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
