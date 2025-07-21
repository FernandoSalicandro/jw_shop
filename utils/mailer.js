import nodemailer from "nodemailer";

// CONFIGURAZIONE SMTP - puoi usare Gmail, Mailtrap, SendGrid, ecc.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica la configurazione del transporter all'avvio
transporter.verify()
  .then(() => {
    console.log('Server SMTP pronto per l\'invio email');
  })
  .catch((error) => {
    console.error('Errore nella configurazione SMTP:', error);
  });

export const sendOrderConfirmation = async (toEmail, subject, htmlContent) => {
  try {
    if (!toEmail || !subject || !htmlContent) {
      throw new Error('Email, oggetto e contenuto sono campi obbligatori');
    }

    const mailOptions = {
      from: `"JW Shop" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email inviata con successo:', info.messageId);
    return info;

  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
    throw new Error(`Errore nell'invio dell'email: ${error.message}`);
  }
};