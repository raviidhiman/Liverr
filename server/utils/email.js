const nodemailer = require("nodemailer");

const isReal = (v) => v && !/dummy|your_|change_me|example/i.test(v);

/**
 * Providers, in order of priority:
 *  1. Brevo HTTP API   (BREVO_API_KEY)    -> works on Render free tier; can email anyone once a sender is verified
 *  2. Resend HTTP API  (RESEND_API_KEY)   -> works on Render free tier; sandbox only emails your own address until a domain is verified
 *  3. SMTP             (EMAIL_HOST/USER/PASS) -> great locally with a Gmail app password
 *  4. none             -> OTP is printed in the server console (local dev only)
 * Returns { delivered: boolean }.
 */
// "Liverr <me@x.com>"  ->  { name: "Liverr", email: "me@x.com" }
const parseFrom = (v) => {
  const m = String(v || "").match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim() || "Liverr", email: m[2].trim() } : { name: "Liverr", email: String(v || "").trim() };
};

const sendMail = async (to, subject, html) => {
  if (isReal(process.env.BREVO_API_KEY)) {
    const sender = parseFrom(process.env.EMAIL_FROM);
    if (!sender.email) throw new Error("EMAIL_FROM must be set to your verified Brevo sender, e.g. Liverr <you@gmail.com>");
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": process.env.BREVO_API_KEY.trim(), "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html }),
    });
    if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
    return { delivered: true };
  }
  if (isReal(process.env.RESEND_API_KEY)) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Liverr <onboarding@resend.dev>", to: [to], subject, html }),
    });
    if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
    return { delivered: true };
  }
  if (isReal(process.env.EMAIL_HOST) && isReal(process.env.EMAIL_USER) && isReal(process.env.EMAIL_PASS)) {
    const port = parseInt(process.env.EMAIL_PORT || "587", 10);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, port, secure: port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM || `"Liverr" <${process.env.EMAIL_USER}>`, to, subject, html });
    return { delivered: true };
  }
  return { delivered: false };
};

const sendOTPEmail = async (to, otp, purpose = "registration") => {
  const isReset = purpose === "reset";
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e4e5e7;border-radius:8px;overflow:hidden">
    <div style="background:#1dbf73;padding:24px 32px"><h1 style="color:#fff;margin:0">Liverr<span style="color:#0e3d28">.</span></h1></div>
    <div style="padding:32px"><h2 style="color:#222325;margin:0 0 8px">${isReset ? "Reset your password" : "Verify your email"}</h2>
    <p style="color:#62646a;font-size:14px">Your one-time code is valid for <strong>5 minutes</strong>:</p>
    <div style="background:#f5f5f5;border:2px dashed #1dbf73;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1dbf73;font-family:monospace">${otp}</span></div>
    <p style="color:#95979d;font-size:12px">Never share this code with anyone.</p></div></div>`;
  const result = await sendMail(to, isReset ? "Reset your password - Liverr" : "Verify your email - Liverr", html);
  if (!result.delivered) console.log(`\n📧 [DEV] No email provider configured. OTP for ${to} (${purpose}): ${otp}\n`);
  return result;
};

module.exports = { sendMail, sendOTPEmail };