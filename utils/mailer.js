import nodemailer from "nodemailer";

// CONFIGURAZIONE SMTP - puoi usare Gmail, Mailtrap, SendGrid, ecc.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmation = async (toEmail, subject, htmlContent) => {
  console.log("✅ Inviando mail a:", toEmail);
  await transporter.sendMail({
    from: `"JW Shop" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlContent,
  });
  console.log("✉️ sendOrderConfirmation chiamato per:", toEmail);
};
