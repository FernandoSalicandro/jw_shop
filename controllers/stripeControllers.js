import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// In stripeControllers.js
const createPaymentIntent = (req, res) => {
  const { amount, customerEmail, items } = req.body;

  if (!amount || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Dati mancanti o prodotti non validi' });
  }

  // Riduci le informazioni nei metadata
  const simplifiedItems = items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity
  }));

  stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'eur',
    receipt_email: customerEmail,
    automatic_payment_methods: { enabled: true },
    metadata: {
      itemCount: items.length.toString(),
      totalAmount: amount.toString()
    }
  }, (err, paymentIntent) => {
    if (err) {
      console.error('Errore creando il paymentIntent:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  });
};

export default {
  createPaymentIntent
};
