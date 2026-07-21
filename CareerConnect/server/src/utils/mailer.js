const nodemailer = require('nodemailer');

// Reads SMTP config from env. If not provided, sendMail will attempt to use Ethereal
// (a nodemailer test account) when NODE_ENV !== 'production'. Otherwise it logs.
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_USER,
  EMAIL_PASS,
  CONTACT_SENDER,
  NODE_ENV
} = process.env;

let transporter = null;
let usingEthereal = false;

async function ensureTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    return transporter;
  }

  // If explicit SMTP not provided, but EMAIL_USER/EMAIL_PASS are present, try Gmail SMTP
  if (EMAIL_USER && EMAIL_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS }
      });
      console.info('[mailer] using EMAIL_USER/EMAIL_PASS with Gmail SMTP');
      return transporter;
    } catch (e) {
      console.warn('[mailer] failed to configure Gmail SMTP with EMAIL_USER/EMAIL_PASS', e);
    }
  }

  // If in development, try Ethereal test account so we can preview messages
  if (NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usingEthereal = true;
      console.info('[mailer] using Ethereal test account for email preview.');
      return transporter;
    } catch (e) {
      console.warn('[mailer] failed to create Ethereal account', e);
    }
  }

  // Fallback: keep transporter null so sendMail will log instead
  return null;
}

async function sendMail({ to, subject, text, html, from }) {
  const recipient = to;
  const mailFrom = from || CONTACT_SENDER || (SMTP_USER ? SMTP_USER : `no-reply@localhost`);

  const t = await ensureTransporter();
  if (!t) {
    console.warn('[mailer] No SMTP transporter available; logging message instead.');
    console.info(`[mailer] to=${recipient} subject=${subject} text=${text} html=${!!html}`);
    return { logged: true };
  }

  const mailOptions = { from: mailFrom, to: recipient, subject, text, html };
  const result = await t.sendMail(mailOptions);

  if (usingEthereal) {
    // Provide preview URL from nodemailer
    const previewUrl = nodemailer.getTestMessageUrl(result);
    console.info('[mailer] Ethereal message preview URL:', previewUrl);
    return { result, previewUrl };
  }

  return { result };
}

module.exports = { sendMail };
