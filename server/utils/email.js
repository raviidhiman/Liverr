const nodemailer = require("nodemailer");
const sendOTPEmail = async (to, otp, purpose = "registration") => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT),
    secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const isReset = purpose === "reset";
  await transporter.sendMail({
    from: `"FreelanceHub" <${process.env.EMAIL_USER}>`, to,
    subject: isReset ? "Reset Your Password - FreelanceHub" : "Verify Your Email - FreelanceHub",
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e4e5e7;border-radius:8px;overflow:hidden"><div style="background:#1dbf73;padding:24px 32px"><h1 style="color:#fff;margin:0">FreelanceHub</h1></div><div style="padding:32px"><h2 style="color:#222325;margin:0 0 8px">${isReset?"Reset Password":"Verify Email"}</h2><p style="color:#62646a;font-size:14px">OTP valid for <strong>5 minutes</strong>:</p><div style="background:#f5f5f5;border:2px dashed #1dbf73;border-radius:8px;padding:24px;text-align:center;margin:24px 0"><span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1dbf73;font-family:monospace">${otp}</span></div><p style="color:#95979d;font-size:12px">Never share this code.</p></div></div>`,
  });
};
module.exports = { sendOTPEmail };
