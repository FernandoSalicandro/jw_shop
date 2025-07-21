import { sendOrderConfirmation } from '../utils/mailer.js';

const sendOrderEmails = async (req, res) => {
    try {
        const { orderDetails } = req.body;

        // Validazione dei dati necessari
        if (!orderDetails) {
            return res.status(400).json({
                success: false,
                error: 'Dettagli ordine mancanti'
            });
        }

        // Verifica che tutti i campi necessari siano presenti
        const requiredFields = ['cart', 'customer', 'paymentIntentId', 'totalAmount'];
        const missingFields = requiredFields.filter(field => !orderDetails[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Campi mancanti: ${missingFields.join(', ')}`
            });
        }

        // Verifica dei dati del cliente
        const requiredCustomerFields = ['email', 'firstName', 'lastName', 'address', 'city', 'country'];
        const missingCustomerFields = requiredCustomerFields.filter(field => !orderDetails.customer[field]);

        if (missingCustomerFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Dati cliente mancanti: ${missingCustomerFields.join(', ')}`
            });
        }

        // Verifica che il carrello non sia vuoto
        if (!orderDetails.cart.length) {
            return res.status(400).json({
                success: false,
                error: 'Carrello vuoto'
            });
        }
        
        // Prepara il template HTML per l'email del cliente
        const customerHtml = `
            <h2>Grazie per il tuo ordine su JW Shop!</h2>
            <p>Ordine #${orderDetails.paymentIntentId}</p>
            <h3>Riepilogo ordine:</h3>
            <ul>
                ${orderDetails.cart.map(item => `
                    <li>
                        ${item.name}<br>
                        Quantità: ${item.quantity}<br>
                        Prezzo: €${item.price}
                    </li>
                `).join('')}
            </ul>
            <p><strong>Totale ordine: €${orderDetails.totalAmount}</strong></p>
            <h3>Dettagli spedizione:</h3>
            <p>
                ${orderDetails.customer.firstName} ${orderDetails.customer.lastName}<br>
                ${orderDetails.customer.address}<br>
                ${orderDetails.customer.city}, ${orderDetails.customer.postalCode || ''}<br>
                ${orderDetails.customer.country}
            </p>
        `;
        
        // Prepara il template HTML per l'email dell'admin
        const adminHtml = `
            <h2>Nuovo ordine ricevuto!</h2>
            <p>ID Ordine: ${orderDetails.paymentIntentId}</p>
            <h3>Dettagli cliente:</h3>
            <p>
                Nome: ${orderDetails.customer.firstName} ${orderDetails.customer.lastName}<br>
                Email: ${orderDetails.customer.email}<br>
                Telefono: ${orderDetails.customer.phone || 'Non specificato'}<br>
                Indirizzo: ${orderDetails.customer.address}<br>
                Città: ${orderDetails.customer.city}<br>
                CAP: ${orderDetails.customer.postalCode || 'Non specificato'}<br>
                Paese: ${orderDetails.customer.country}
            </p>
            <h3>Prodotti ordinati:</h3>
            <ul>
                ${orderDetails.cart.map(item => `
                    <li>
                        ${item.name}<br>
                        Quantità: ${item.quantity}<br>
                        Prezzo: €${item.price}<br>
                        Subtotale: €${(item.price * item.quantity).toFixed(2)}
                    </li>
                `).join('')}
            </ul>
            <p><strong>Totale ordine: €${orderDetails.totalAmount}</strong></p>
        `;

        try {
            // Invia email al cliente
            await sendOrderConfirmation(
                orderDetails.customer.email,
                'Conferma del tuo ordine - JW Shop',
                customerHtml
            );

            // Invia email all'admin
            await sendOrderConfirmation(
                process.env.ADMIN_EMAIL,
                'Nuovo ordine ricevuto - JW Shop',
                adminHtml
            );

            res.status(200).json({ 
                success: true,
                message: 'Email di conferma inviate con successo'
            });
        } catch (emailError) {
            console.error('Errore nell\'invio delle email:', emailError);
            return res.status(500).json({ 
                success: false,
                error: 'Errore nell\'invio delle email di conferma'
            });
        }

    } catch (error) {
        console.error('Errore generico:', error);
        res.status(500).json({ 
            success: false,
            error: 'Errore interno del server'
        });
    }
};

export default { sendOrderEmails };