import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  const { amount, customerEmail, items, originalPaymentIntentId } = req.body;

  if (!amount || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Dati mancanti o prodotti non validi' });
  }

  try {
    let paymentIntent;

    if (originalPaymentIntentId) {
      // Se c'è un PaymentIntent originale, lo aggiorniamo
      paymentIntent = await stripe.paymentIntents.update(originalPaymentIntentId, {
        amount: Math.round(amount * 100),
        metadata: {
          itemCount: items.length.toString(),
          totalAmount: amount.toString(),
          isUpdated: 'true'
        }
      });
    } else {
      // Altrimenti ne creiamo uno nuovo
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'eur',
        receipt_email: customerEmail,
        automatic_payment_methods: { enabled: true },
        metadata: {
          itemCount: items.length.toString(),
          totalAmount: amount.toString()
        }
      });
    }

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error('Errore gestendo il paymentIntent:', err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  createPaymentIntent
};