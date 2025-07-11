import connection from "../data/jw_db.js"; // Importa la connessione al database MySQL

const confirmOrder = (req, res, next) => {
  // Estrai i dati dell'ordine dal body della richiesta
  const { firstName, lastName, email,  phoneNumber, billingAddress, paymentMethod, cart} = req.body;
  console.log("Dati ricevuti:", req.body);

  // Validazione base: controlla che tutti i campi obbligatori siano presenti
  if (!firstName || !lastName || !email || !phoneNumber || !billingAddress || !Array.isArray(cart) || cart.length === 0 || !paymentMethod) {
    return res.status(400).json({ success: false, message: "Dati mancanti o non validi." });
  }

  // Calcolo del totale dell'ordine (prezzo fittizio: 100€ per ogni unità)
  const totalPrice = cart.reduce((acc, item) => acc + item.quantity * 1000, 0);

  // Inizia una transazione per garantire la consistenza dei dati
  connection.beginTransaction((err) => {
    if (err) return next(err); // Se c'è un errore nel creare la transazione, passa l'errore al middleware

    // Query per inserire l'ordine nella tabella `orders`
    const qOrder = `
      INSERT INTO orders (first_name, last_name, email, phone_number, billing_address, payment_method, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Esegui l'inserimento dell'ordine
    connection.query(qOrder, [firstName, lastName, email, phoneNumber, billingAddress, paymentMethod, totalPrice], (err, result) => {
      if (err) {
        // Se qualcosa va storto, annulla la transazione
        return connection.rollback(() => {
          console.error("Errore durante l'inserimento:", err); // log utile
          next(err);
        });
      }

      // Ottieni l'ID dell'ordine appena inserito
      const orderId = result.insertId;
      

      // Prepara i valori per l'inserimento multiplo nella tabella `order_items`
      // Ogni riga sarà [orderId, productId, quantity]
      const values = cart.map((item) => [orderId, item.productId, item.quantity]);

      // Query per inserire i prodotti dell'ordine
      const qItems = `
        INSERT INTO order_product (order_id, product_id, quantity)
        VALUES ?
      `;

      // Esegui l'inserimento degli articoli dell'ordine
      connection.query(qItems, [values], (err) => {
        if (err) {
          // Se qualcosa va storto, annulla la transazione
          return connection.rollback(() => {
            console.error("Errore durante l'inserimento:", err); // log utile
            next(err);
          });
        }

        // Se tutto è andato bene, conferma la transazione
        connection.commit((err) => {
          if (err) {
            // Se fallisce il commit finale, annulla tutto
            return connection.rollback(() => {
              console.error("Errore durante l'inserimento:", err); // log utile
              next(err);
            });
          }

          // Calcola una data di consegna stimata (4 giorni dopo oggi)
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

          // Rispondi al client con i dettagli dell'ordine confermato
          return res.status(201).json({
            success: true,
            orderId,
            message: "Ordine salvato e confermato!",
            estimatedDelivery: estimatedDelivery.toISOString().split("T")[0],
            totalPrice: totalPrice.toFixed(2),
          });
        });
      });
    });
  });
};

export default confirmOrder;
