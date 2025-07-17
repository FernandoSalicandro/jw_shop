import nodemailer from "nodemailer";

// CONFIGURAZIONE SMTP - puoi usare Gmail, Mailtrap, SendGrid, ecc.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // es: "yourshop@gmail.com"
    pass: process.env.EMAIL_PASS, // una app password se usi Gmail!
  },
});

export const sendOrderConfirmation = async (toEmail, subject, htmlContent) => {
  await transporter.sendMail({
    from: `"JW Shop" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlContent,
  });
};
