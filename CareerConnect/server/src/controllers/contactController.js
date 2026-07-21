const mongoose = require('mongoose');
const { sendMail } = require('../utils/mailer');

async function submitContactForm(req, res) {
  const ContactMessage = mongoose.model('ContactMessage');
  const { name, email, message, mobile } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // Validate mobile if provided
  if (!mobile || !/^\d{10}$/.test(String(mobile))) {
    return res.status(400).json({ message: 'Mobile number is required and must be 10 digits.' });
  }
  try {
  const contactMessage = await ContactMessage.create({ name, email, message, mobile });

    // Send email to configured recipient (use CONTACT_RECIPIENT env var)
    const recipient = process.env.CONTACT_RECIPIENT || process.env.CONTACT_EMAIL || null;
    const siteName = process.env.SITE_NAME || 'CareerConnect';
  let ownerMailResult = null;
  if (recipient) {
      const subject = `[${siteName}] New contact form message from ${name}`;
      const text = `Site: ${siteName}\nName: ${name}\nEmail: ${email}\nMobile: ${mobile || 'N/A'}\n\nMessage:\n${message}`;
      const html = `<p><strong>Site:</strong> ${siteName}</p><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mobile:</strong> ${mobile || 'N/A'}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`;
      try {
  ownerMailResult = await sendMail({ to: recipient, subject, text, html });
  // Log the mail result for debugging. If transporter wasn't configured, mailer.sendMail resolves with { logged: true }
  console.info('[contactController] email notification result:', ownerMailResult);
      } catch (mailErr) {
        console.warn('[contactController] failed to send email notification', mailErr);
        // Do not fail the request if email sending fails — we already stored the message
      }
    } else {
      console.info('[contactController] CONTACT_RECIPIENT not configured; skipping owner notification.');
    }

    // Also send a confirmation/auto-reply to the submitter's email address
    let confirmResult = null;
    try {
      const confSubject = `Thanks for contacting ${siteName}`;
      const confText = `Hi ${name},\n\nThanks for reaching out to ${siteName}. We received your message and will respond as soon as possible.\n\nYour message:\n${message}\n\nMobile: ${mobile || 'N/A'}\n\n--\n${siteName}`;
      const confHtml = `<p>Hi ${name},</p><p>Thanks for reaching out to ${siteName}. We received your message and will respond as soon as possible.</p><hr/><p><strong>Your message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p><p><strong>Mobile:</strong> ${mobile || 'N/A'}</p><p>— ${siteName}</p>`;
      confirmResult = await sendMail({ to: email, subject: confSubject, text: confText, html: confHtml });
      console.info('[contactController] confirmation email result:', confirmResult);
    } catch (confErr) {
      console.warn('[contactController] failed to send confirmation email to submitter', confErr);
      // still don't fail the request
    }

    // Return mailer results too so frontend can show preview URLs or send status
    res.status(201).json({ message: 'Message sent successfully', data: contactMessage, mail: { owner: ownerMailResult, confirmation: confirmResult } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
}

module.exports = { submitContactForm };