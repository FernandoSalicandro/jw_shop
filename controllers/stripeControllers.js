import Stripe from 'stripe';
import connection from '../data/jw_db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook per gestire gli eventi Stripe -- correzione : l'ho eliminata perchè non esiste più la checkout session

// -- fernando -- aggiungo la funzione createPaymentIntent
const createPaymentIntent = (req, res) => {
  //creo e destrutturo i valori che mi servono -- correzione ho aggiunto anche items (ci serve per lo scontrino e per lo stock managing)
  const { amount, customerEmail, items } = req.body;

  //faccio una piccola validazione 
  if (!amount || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Dati mancanti o prodotti non validi' });
  }

  //-- correzione: uso Promise.all per far prima tutti i controlli e update, e solo dopo creare il paymentIntent
  const checkAndUpdateStockPromises = items.map(item => {
    //prelevo le cose che mi servono : id e quantità
    const { id, quantity } = item;

    //torno una Promise che verifica stock e scala se tutto ok
    return new Promise((resolve, reject) => {
      //validiamo la disponibilità prima dell'update
      connection.query('SELECT stock_quantity FROM product WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.log(` Errore leggendo il prodotto con ID ${id}:`, err);
          return reject(`Errore verificando disponibilità per il prodotto con ID ${id}`);
        }

        const available = results[0]?.stock_quantity || 0;

        //verifichiamo che la quantità richiesta non sia maggiore di quella disponibile
        if (available < quantity) {
          return reject(`Quantità non disponibile per il prodotto con ID ${id}`);
        }

        //dopo aver passato lo stock managing scaliamo
        connection.query(
          'UPDATE product SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
          [quantity, id, quantity],
          (updateErr) => {
            if (updateErr) {
              console.log(` Errore scalando il prodotto con ID ${id}:`, updateErr);
              return reject(`Errore scalando il prodotto con ID ${id}`);
            }
            // se è tutto ok per questo prodotto risolviamo
            resolve(); 
          }
        );
      });
    });
  });

  //aspettiamo che tutte le promesse vadano a buon fine
  Promise.all(checkAndUpdateStockPromises)
    .then(() => {
      //ok ora creo l'intento di pagamento tramite la funzione createPaymentIntent
      stripe.paymentIntents.create({
        //perchè stripe accetta solo i valori in centesimi
        amount: Math.round(amount * 100),
        currency: 'eur',
        receipt_email: customerEmail,
        //qua sotto dico a stripe che voglio abilitare tutti i metodi di pagamento possibili immaginabili DIOCAN :))))))
        automatic_payment_methods: { enabled: true },
        //qua sto aggiungendo il metadata che ci serve per gestire robe tipo il riepilogo
        metadata: {
          order: JSON.stringify(items)
        }
      }, function (err, paymentIntent) {
        //qua sotto gestisco l'eventuale errore
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        //ritorno il client secret che è il codice che mi serve in FRONTEND per CONFERMARE IL PAGAMENTO
        res.json({ clientSecret: paymentIntent.client_secret });
      });
    })
    .catch(errorMsg => {
      //qua dentro ci finisce qualsiasi reject di Promise.all
      console.log(" Errore durante il processo di controllo/scala stock:", errorMsg);
      res.status(500).json({ error: errorMsg });
    });
};

export default {
  //ho eliminato la checkout session
  //elimino il webhook
  //qua modifico l'export per includere il paymentIntent
  createPaymentIntent
};
