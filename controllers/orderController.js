import Stripe from "stripe";
import connection from "../data/jw_db.js";
import { sendOrderConfirmation } from "../utils/mailer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const confirmOrder = async (req, res) => {
  const { formData, cart, selectedCountry, selectedRegion, subtotal_price, discount_value, total_price, payment_method } = req.body;

  try {
    // 1. Crea PaymentIntent su Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_price * 100),
      currency: "eur",
      metadata: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
      },
    });

    // Log del PaymentIntent creato
    console.log('DEBUG - Created PaymentIntent:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret
    });

    // 2. Indirizzo in formato testo
    const billing_address = `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}`;
    const shipping_address = `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}, ${formData.city}, ${selectedRegion}, ${selectedCountry} - ${formData.postalCode}`;

    const values = [
      paymentIntent.id,
      total_price,
      subtotal_price,
      "", // discount_code
      discount_value,
      payment_method,
      billing_address,
      shipping_address,
      formData.email,
      formData.firstName,
      formData.lastName,
      formData.phone,
      "pending",
      "in_progress",
    ];

    // Log dei valori prima dell'inserimento
    console.log('DEBUG - Inserting order with values:', {
      payment_intent_id: paymentIntent.id,
      total_price,
      email: formData.email
    });

    const sql = `
      INSERT INTO orders (
        stripe_payment_intent_id,
        total_price,
        subtotal_price,
        discount_code,
        discount_value,
        payment_method,
        billing_address,
        shipping_address,
        email,
        first_name,
        last_name,
        phone_number,
        payment_status,
        order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("DEBUG - DB Error:", err);
        return res.status(500).json({ error: "Errore nel salvataggio dell'ordine" });
      }

      const orderId = result.insertId;
      console.log('DEBUG - Order created:', {
        orderId,
        payment_intent_id: paymentIntent.id
      });

      // Inserisco tutti i prodotti in order_items
      const itemQueries = cart.map((item) => {
        return new Promise((resolve, reject) => {
          const insertItemSQL = `
            INSERT INTO order_product (
              order_id,
              product_id,
              product_name,
              quantity,
              price,
              subtotal
            ) VALUES (?, ?, ?, ?, ?, ?)
          `;

          const subtotal = item.price * item.quantity;

          const itemValues = [
            orderId,
            item.id,
            item.name,
            item.quantity,
            item.price,
            subtotal
          ];

          connection.query(insertItemSQL, itemValues, (err) => {
            if (err) {
              console.error("Errore inserimento item:", err);
              return reject(err);
            }
            resolve();
          });
        });
      });

      Promise.all(itemQueries)
        .then(() => {
          return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            orderId,
            paymentIntentId: paymentIntent.id
          });
        })
        .catch((error) => {
          console.error("Errore salvataggio prodotti:", error);
          return res.status(500).json({ error: "Errore nel salvataggio dei prodotti ordinati" });
        });
    });
  } catch (err) {
    console.error("DEBUG - Stripe Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

const updatePaymentStatus = (req, res) => {
  const { payment_intent_id, status } = req.body;

  console.log('DEBUG - Updating Payment:', {
    receivedId: payment_intent_id,
    receivedStatus: status,
    timestamp: new Date().toISOString()
  });

  if (!payment_intent_id) {
    console.error('DEBUG - Payment intent ID mancante');
    return res.status(400).json({ error: "Payment intent ID richiesto" });
  }

  // Prima recuperiamo i dati dell'ordine
  connection.query(
    `SELECT o.* 
     FROM orders o 
     WHERE o.stripe_payment_intent_id = ?`,
    [payment_intent_id],
    async (err, orderResults) => {
      if (err) {
        console.error('DEBUG - Error checking order:', err);
        return res.status(500).json({ error: "Errore nel recupero dell'ordine" });
      }

      if (orderResults.length === 0) {
        return res.status(404).json({ error: "Ordine non trovato" });
      }

      const order = orderResults[0];

      // Poi recuperiamo i prodotti dell'ordine
      connection.query(
        `SELECT * FROM order_product WHERE order_id = ?`,
        [order.id],
        async (err, productResults) => {
          if (err) {
            console.error('DEBUG - Error checking products:', err);
            return res.status(500).json({ error: "Errore nel recupero dei prodotti" });
          }

          // Aggiorniamo lo stato
          connection.query(
            `UPDATE orders SET payment_status = ? WHERE stripe_payment_intent_id = ?`,
            [status, payment_intent_id],
            async (updateErr, updateResult) => {
              if (updateErr) {
                console.error("DEBUG - Update Error:", updateErr);
                return res.status(500).json({ error: "Errore aggiornamento" });
              }

              // Se il pagamento è succeeded, inviamo le email
              if (status === 'succeeded') {
                const orderProducts = productResults.map(row => ({
                  quantity: row.quantity,
                  name: row.product_name,
                  price: parseFloat(row.price)
                }));

                console.log('DEBUG - Order data:', {
                  orderId: order.id,
                  products: orderProducts
                });

                const customerMessage = `
                  <h2>Ciao ${order.first_name}, grazie per il tuo ordine!</h2>
                  <p>Riepilogo:</p>
                  <ul>
                    ${orderProducts.map((item) => `<li>${item.quantity}x ${item.name} – ${(item.quantity * item.price).toFixed(2)} €</li>`).join("")}
                  </ul>
                  <p><strong>Totale: ${parseFloat(order.total_price).toFixed(2)} €</strong></p>
                  <p>Riceverai aggiornamenti sulla spedizione a questo indirizzo: ${order.email}</p>
                `;

                const adminMessage = `
                  <h2>Nuovo ordine ricevuto e pagato</h2>
                  <p>Email cliente: ${order.email}</p>
                  <p>Totale: ${parseFloat(order.total_price).toFixed(2)} €</p>
                  <p>Ordine ID: ${order.id}</p>
                  <p>Controlla il pannello admin per gestirlo.</p>
                `;

                try {
                  await sendOrderConfirmation(order.email, "Conferma ordine - JW Shop", customerMessage);
                  await sendOrderConfirmation(process.env.EMAIL_USER, "Nuovo ordine ricevuto", adminMessage);
                } catch (emailErr) {
                  console.error("Errore invio email:", emailErr);
                }
              }

              res.status(200).json({
                message: "Stato pagamento aggiornato",
                affectedRows: updateResult.affectedRows
              });
            }
          );
        }
      );
    }
  );
};

const processingOrder = {
  confirmOrder,
  updatePaymentStatus,
};

export default processingOrder;