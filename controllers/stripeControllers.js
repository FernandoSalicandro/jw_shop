import Stripe from 'stripe';
import connection from '../data/jw_db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    try {
        const { items, customerEmail } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        images: [item.image_url],
                    },
                    //centesimi
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            customer_email: customerEmail,
            success_url: `${process.env.FE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FE_URL}/cart`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Webhook per gestire gli eventi Stripe
const webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Gestione degli eventi
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            try {
                // Query per salvare l'ordine nel db
                await connection.promise().query(`
                    INSERT INTO orders (
                        stripe_session_id,
                        stripe_payment_intent_id,
                        total_price,
                        payment_status,
                        order_status,
                        email,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
                `, [
                    session.id,
                    session.payment_intent,
                    session.amount_total / 100,
                    'completed',
                    'pending',
                    session.customer_email
                ]);
            } catch (error) {
                console.error('Error saving order:', error);
            }
            break;

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
};

export default {
    createCheckoutSession,
    webhook
};