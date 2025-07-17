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
        .then(async () => {
          // Costruisci contenuto email
          const customerMessage = `
    <h2>Ciao ${formData.firstName}, grazie per il tuo ordine!</h2>
    <p>Riepilogo:</p>
    <ul>
      ${cart.map((item) => `<li>${item.quantity}x ${item.name} – ${(item.quantity * item.price).toFixed(2)} €</li>`).join("")}
    </ul>
    <p><strong>Totale: ${total_price.toFixed(2)} €</strong></p>
    <p>Riceverai aggiornamenti sulla spedizione a questo indirizzo: ${formData.email}</p>
  `;

          const adminMessage = `
    <h2>Nuovo ordine ricevuto</h2>
    <p>Email cliente: ${formData.email}</p>
    <p>Totale: ${total_price.toFixed(2)} €</p>
    <p>Ordine ID: ${orderId}</p>
    <p>Controlla il pannello admin per gestirlo.</p>
  `;

          try {
            // Mail al cliente
            await sendOrderConfirmation(formData.email, "Conferma ordine - JW Shop", customerMessage);

            // Mail all’admin
            await sendOrderConfirmation("admin@jwshop.com", "Nuovo ordine ricevuto", adminMessage);
          } catch (emailErr) {
            console.error("Errore invio email:", emailErr);
            // Non bloccare la risposta se fallisce la mail
          }

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

  const sql = `UPDATE orders SET payment_status = ? WHERE stripe_payment_intent_id = ?`;

  connection.query(sql, [status, payment_intent_id], (err, result) => {
    if (err) {
      console.error("Errore aggiornamento stato pagamento:", err);
      return res.status(500).json({ error: "Errore aggiornamento" });
    }

    res.status(200).json({ message: "Stato pagamento aggiornato" });
  });
};

const processingOrder = {
  confirmOrder,
  updatePaymentStatus,
};

export default processingOrder;
