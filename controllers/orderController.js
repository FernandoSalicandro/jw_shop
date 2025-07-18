import connection from '../data/jw_db.js'

const confirmOrder = async (req, res) => {
    const { 
        formData, cart, selectedCountry, selectedRegion, 
        subtotal_price, discount_value, total_price, payment_method,
        payment_intent_id, original_payment_intent_id 
    } = req.body;

    const orderQuery = `
        INSERT INTO orders (
            total_price, 
            subtotal_price, 
            discount_value, 
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const orderValues = [
        total_price,
        subtotal_price,
        discount_value || 0,
        payment_method,
        formData.address,
        formData.address, // using same address for shipping
        formData.email,
        formData.firstName,
        formData.lastName,
        formData.phone,
        payment_intent_id,
        original_payment_intent_id || payment_intent_id,
        'pending',
        'processing',
    ];

    connection.query(orderQuery, orderValues, (err, orderResult) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Database error' });
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

        connection.query(orderProductQuery, [orderProductValues], (err, orderProductResult) => {
            if (err) {
                console.error('Error creating order products:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(200).json({
                orderId: orderId,
                paymentIntentId: payment_intent_id,
                message: 'Order created successfully'
            });
        });
    });
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
            console.error('Error updating payment status:', err);
            return res.status(500).json({ error: "Database error" });
        }

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