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
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px; padding: 40px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="black"
                style="background-color: black; background-size: contain; background-repeat: no-repeat; padding: 20px; border-radius: 8px;">
                <tr>
                    <td style="font-family: Arial, sans-serif; color: white;">

                        <h1 style="text-align: center; color: gold; padding-top: 20px;">JW LUX</h1>

                        <h2 style="color: white; padding-top: 0px;">
                            Grazie per aver scelto <strong>JW Shop</strong>! Il tuo ordine è stato ricevuto
                            correttamente e verrà elaborato al più presto.
                        </h2>

                        <p style="font-size: 14px;">Ordine #${orderDetails.paymentIntentId}</p>

                        <h3 style="color: gold;">Riepilogo ordine:</h3>
                        <ul style="font-size: 14px; padding-left: 20px; color: white;">
                            ${orderDetails.cart.map(item => `
                            <li style="margin-bottom: 10px;">
                                <strong>${item.name}</strong><br>
                                Quantità: ${item.quantity}<br>
                                Prezzo: €${item.price}
                            </li>
                            `).join('')}
                        </ul>

                        <p style="font-size: 18px; font-weight: bold;">Totale ordine: €${orderDetails.totalAmount}</p>

                        <h3 style="color: gold;">Dettagli spedizione:</h3>
                        <p style="font-size: 14px;">
                            ${orderDetails.customer.firstName} ${orderDetails.customer.lastName}<br>
                            ${orderDetails.customer.address}<br>
                            ${orderDetails.customer.city}, ${orderDetails.customer.postalCode || ''}<br>
                            ${orderDetails.customer.country}
                        </p>

                        <p style="font-family: Arial, sans-serif; font-size: 14px; color: white;">
                            Non appena il tuo pacco sarà spedito, riceverai una nuova email con il link per tracciare la
                            spedizione.
                        </p>

                        <p style="font-family: Arial, sans-serif; font-size: 14px; color: white;">
                            Se hai bisogno di assistenza, puoi contattarci in qualsiasi momento rispondendo a questa
                            email o visitando il nostro
                            <a href="https://jwshop.it/contatti" style="color: gold;">centro assistenza</a>.
                        </p>

                        <p style="font-family: Arial, sans-serif; font-size: 14px; color: white;">
                            A presto!<br>
                            <strong>Il team di JW Shop</strong>
                        </p>

                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
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