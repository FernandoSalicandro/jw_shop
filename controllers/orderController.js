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

    // 2. Indirizzo in formato testo
    const billing_address = `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}`;
    const shipping_address = `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}, ${formData.city}, ${selectedRegion}, ${selectedCountry} - ${formData.postalCode}`;

    // 3. Query per salvare l'ordine
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

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("Errore DB:", err);
        return res.status(500).json({ error: "Errore nel salvataggio dell'ordine" });
      }

      const orderId = result.insertId;

      // Inserisco tutti i prodotti in order_items
      const itemQueries = cart.map((item) => {
        const { id: product_id, name: product_name, quantity, price } = item;
        const subtotal = price * quantity;

        return new Promise((resolve, reject) => {
          const insertItemSQL = `
            INSERT INTO order_product (order_id, product_id, product_name, quantity, price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          const itemValues = [orderId, product_id, product_name, quantity, price, subtotal];

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
          });
        })
        .catch((error) => {
          console.error("Errore salvataggio prodotti:", error);
          return res.status(500).json({ error: "Errore nel salvataggio dei prodotti ordinati" });
        });
    });
  } catch (err) {
    console.error("Errore Stripe:", err);
    return res.status(500).json({ error: err.message });
  }
};

const updatePaymentStatus = (req, res) => {
  const { payment_intent_id, status } = req.body;
  console.log("🔥 updatePaymentStatus ricevuto con:", req.body);

  const paymentStatus = status;
  const orderStatus = status === "succeeded" ? "completed" : "cancelled";

  const sql = `
    UPDATE orders
    SET payment_status = ?, order_status = ?
    WHERE stripe_payment_intent_id = ?
  `;

  connection.query(sql, [paymentStatus, orderStatus, payment_intent_id], (err, result) => {
    if (err) {
      console.error("Errore aggiornamento stato ordine:", err);
      return res.status(500).json({ error: "Errore aggiornamento stato ordine" });
    }

    // Se il pagamento è riuscito, recuperiamo i dati per inviare la mail
    if (status === "succeeded") {
      const fetchSql = `
    SELECT o.*, op.product_name, op.quantity, op.price
    FROM orders o
    JOIN order_product op ON o.id = op.order_id
    WHERE o.stripe_payment_intent_id = ?
  `;

      connection.query(fetchSql, [payment_intent_id], async (err, results) => {
        if (err) {
          console.error("Errore nel recupero dati per l'email:", err);
          return res.status(500).json({ message: "Pagamento aggiornato, ma errore nel recupero ordine per l'email" });
        }

        if (!results || results.length === 0) {
          console.error("Nessun risultato trovato per l'email");
          return res.status(404).json({ message: "Ordine non trovato per invio email" });
        }

        const orderInfo = results[0];
        const groupedItems = results.map((item) => `<li>${item.quantity}x ${item.product_name} – ${(item.price * item.quantity).toFixed(2)} €</li>`);
        console.log("📧 Preparazione invio email a:", orderInfo.email);

        const customerMessage = `
      <h2>Ciao ${orderInfo.first_name}, grazie per il tuo ordine!</h2>
      <p>Riepilogo:</p>
      <ul>${groupedItems.join("")}</ul>
      <p><strong>Totale: ${orderInfo.total_price.toFixed(2)} €</strong></p>
      <p>Riceverai aggiornamenti sulla spedizione a questo indirizzo: ${orderInfo.email}</p>
    `;

        const adminMessage = `
      <h2>Nuovo ordine completato</h2>
      <p>Email cliente: ${orderInfo.email}</p>
      <p>Totale: ${orderInfo.total_price.toFixed(2)} €</p>
      <p>Ordine ID: ${orderInfo.id}</p>
    `;

        try {
          await sendOrderConfirmation(orderInfo.email, "Conferma ordine - JW Shop", customerMessage);
          await sendOrderConfirmation("admin@jwshop.com", "Nuovo ordine completato", adminMessage);
          res.status(200).json({ message: "Stato aggiornato e email inviate" });
        } catch (mailErr) {
          console.error("Errore invio email:", mailErr);
          res.status(200).json({ message: "Stato aggiornato, errore invio email" });
        }
      });
    } else {
      // Pagamento fallito: aggiorno solo stato
      res.status(200).json({ message: "Stato aggiornato, nessuna email inviata" });
    }
  });
};

const processingOrder = {
  confirmOrder,
  updatePaymentStatus,
};

export default processingOrder;
