import { createTransport } from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  ADMIN_EMAIL,
} = process.env;

let transporter;

function getTransporter() {
  if (!SMTP_HOST) return null;
  if (!transporter) {
    transporter = createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT ?? `587`),
      secure: SMTP_PORT === `465`,
      auth: SMTP_USER
        ? { user: SMTP_USER, pass: SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Send an email. Silently skips if SMTP is not configured.
 */
export async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: SMTP_FROM ?? SMTP_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error(`[email] Failed to send "${subject}":`, e.message);
  }
}

/**
 * Notify the admin that a new user has signed up and needs to be enabled.
 */
export async function notifyAdminOfSignup(username) {
  if (!ADMIN_EMAIL) return;
  const { WEB_EDITOR_HOSTNAME } = process.env;
  const adminUrl = `https://${WEB_EDITOR_HOSTNAME}/v1/admin`;
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `New signup: ${username}`,
    text: `${username} just signed up on ${WEB_EDITOR_HOSTNAME} and needs their account enabled.\n\n${adminUrl}`,
    html: `<p><strong>${username}</strong> just signed up on ${WEB_EDITOR_HOSTNAME} and needs their account enabled.</p><p><a href="${adminUrl}">${adminUrl}</a></p>`,
  });
}
