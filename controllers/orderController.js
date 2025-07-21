import connection from '../data/jw_db.js'

const confirmOrder = async (req, res) => {
    try {
        const { 
            formData, cart, selectedCountry, selectedRegion, 
            subtotal_price, discount_value, discount_code, total_price, payment_method,
            payment_intent_id, original_payment_intent_id 
        } = req.body;

        // Log dei dati ricevuti
        console.log('Dati ordine ricevuti:', {
            subtotal_price,
            discount_value,
            discount_code,
            total_price,
            payment_method
        });

        const orderQuery = `
            INSERT INTO orders (
                total_price, 
                subtotal_price, 
                discount_value,
                discount_code, 
                payment_method, 
                billing_address, 
                shipping_address,
                email, 
                first_name, 
                last_name, 
                phone_number,
                stripe_payment_intent_id,
                original_payment_intent_id,
                payment_status,
                order_status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const orderValues = [
            total_price,
            subtotal_price,
            discount_value || 0,
            discount_code || null,
            payment_method,
            formData.address,
            formData.address,
            formData.email,
            formData.firstName,
            formData.lastName,
            formData.phone,
            payment_intent_id,
            original_payment_intent_id || payment_intent_id,
            'pending',
            'processing'
        ];

        // Log dei valori della query
        console.log('Valori per insert ordine:', orderValues);

        connection.query(orderQuery, orderValues, (err, orderResult) => {
            if (err) {
                console.error('Errore creazione ordine:', err);
                console.error('Query SQL:', orderQuery);
                console.error('Valori:', orderValues);
                return res.status(500).json({ 
                    error: 'Database error', 
                    details: err.message 
                });
            }

            
            const orderId = orderResult.insertId;

            // Calcola il fattore di sconto
            const discountFactor = discount_value > 0 ? (1 - (discount_value / subtotal_price)) : 1;

            // Prepara i valori per order_product
            const orderProductValues = cart.map(item => [
                orderId,
                item.id,
                item.name,
                item.quantity,
                item.price * discountFactor, // prezzo scontato
                (item.price * item.quantity) * discountFactor, // subtotale scontato
                item.price, // prezzo originale
                item.name
            ]);

            const orderProductQuery = `
                INSERT INTO order_product (
                    order_id, 
                    product_id, 
                    product_name, 
                    quantity, 
                    price, 
                    subtotal,
                    price_at_time,
                    name_at_time
                ) VALUES ?
            `;

            // Log dei prodotti dell'ordine
            console.log('Prodotti da inserire:', orderProductValues);

            connection.query(orderProductQuery, [orderProductValues], (err, orderProductResult) => {
                if (err) {
                    console.error('Errore creazione prodotti ordine:', err);
                    console.error('Query SQL:', orderProductQuery);
                    console.error('Valori:', orderProductValues);
                    return res.status(500).json({ 
                        error: 'Database error', 
                        details: err.message 
                    });
                }

                console.log('Ordine creato con successo:', {
                    orderId,
                    paymentIntentId: payment_intent_id,
                    discountCode: discount_code,
                    totalPrice: total_price
                });

                res.status(200).json({
                    orderId: orderId,
                    paymentIntentId: payment_intent_id,
                    message: 'Order created successfully'
                });
            });
        });
    } catch (error) {
        console.error('Errore generico:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
};

const updatePaymentStatus = (req, res) => {
    const { payment_intent_id, original_payment_intent_id, status } = req.body;
    const paymentId = original_payment_intent_id || payment_intent_id;

    if (!paymentId) {
        return res.status(400).json({ error: "Payment intent ID richiesto" });
    }

    const updateQuery = `
        UPDATE orders 
        SET payment_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE stripe_payment_intent_id = ? 
        OR original_payment_intent_id = ?
    `;

    connection.query(updateQuery, [status, paymentId, paymentId], (err, result) => {
        if (err) {
            console.error('Errore aggiornamento stato pagamento:', err);
            return res.status(500).json({ 
                error: "Database error",
                details: err.message 
            });
        }

        console.log('Stato pagamento aggiornato:', {
            paymentId,
            status,
            affectedRows: result.affectedRows
        });

        res.json({ 
            success: true, 
            affected: result.affectedRows 
        });
    });
};

export default {
    confirmOrder,
    updatePaymentStatus
};