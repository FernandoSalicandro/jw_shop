import connection from '../data/jw_db.js';

const scaleStock = (req, res) => {
    console.log('📦 Richiesta scaling stock ricevuta');
    console.log('Body ricevuto:', req.body);

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('❌ Errore validazione input:', { items });
        return res.status(400).json({ error: 'Nessun prodotto valido' });
    }

    console.log('��️ Prodotti da aggiornare:', items);

    const updatePromises = items.map(({ id, quantity }) => {
        console.log(`⚙️ Processando prodotto ID: ${id}, Quantità: ${quantity}`);

        return new Promise((resolve, reject) => {
            connection.query(
                `UPDATE product SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity - ? >= 0`,
                [quantity, id, quantity],
                (err, results) => {
                    if (err) {
                        console.log(`❌ Errore SQL per prodotto ${id}:`, err);
                        return reject(`Errore durante aggiornamento quantità prodotto ${id}`);
                    }

                    console.log(`📝 Risultati update per prodotto ${id}:`, results);

                    if (results.affectedRows === 0) {
                        console.log(`⚠️ Stock insufficiente per prodotto ${id}`);
                        return reject(`Stock insufficiente per prodotto ${id}`);
                    }

                    resolve();
                }
            );
        });
    });

    Promise.all(updatePromises)
        .then(() => {
            console.log('✅ Tutti gli aggiornamenti completati con successo');
            res.json({ message: 'Stock aggiornato con successo' });
        })
        .catch(err => {
            console.log('❌ Errore durante aggiornamento dello stock:', err);
            res.status(500).json({ message: err });
        });
};

export default { scaleStock };