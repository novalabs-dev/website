import nodemailer from "nodemailer";

const ALLOWED_SOURCES = ["repurpose-landing", "repurpose-blog", "repurpose-x"];

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let email, source;
  try {
    const body = await req.json();
    email = body.email;
    source = body.source;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (
    !email ||
    typeof email !== "string" ||
    email.length > 254 ||
    !emailRegex.test(email) ||
    email.includes("\n") ||
    email.includes("\r")
  ) {
    return new Response(JSON.stringify({ error: "Valid email required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  email = email.toLowerCase().trim();

  // Validate source to prevent injection
  const safeSource = ALLOWED_SOURCES.includes(source) ? source : "unknown";

  const transporter = nodemailer.createTransport({
    host: "smtp.porkbun.com",
    port: 587,
    secure: false,
    auth: {
      user: "support@nova-labs.dev",
      pass: process.env.SUPPORT_MAIL_PASSWORD,
    },
  });

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #e0e0e0; background-color: #0a0a0f;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #818cf8; margin: 0;">Nova<span style="color: #888;">Labs</span></h1>
  </div>

  <h2 style="color: #f0f0f0;">You're on the waitlist.</h2>

  <p>Thanks for signing up. We'll send you early access when we launch — along with a demo showing what it actually produces from a real blog post.</p>

  <p>One thing while you wait: if you want to speed things up, reply to this email with a link to a blog post you've written. We'll run it through our prototype and send you the output — LinkedIn, X, and newsletter version. No strings attached.</p>

  <p style="color: #aaa;">We're a small team building this in the open. Your feedback directly shapes what we build.</p>

  <div style="margin: 30px 0; padding: 20px; border: 1px solid #333; border-radius: 8px; background-color: #111;">
    <p style="margin: 0 0 10px 0; font-weight: bold; color: #f0f0f0;">What to expect:</p>
    <ul style="color: #aaa; line-height: 1.8; margin: 0; padding-left: 20px;">
      <li>Early access before public launch</li>
      <li>Launch pricing (lower than what we'll charge later)</li>
      <li>A personal demo using your actual content</li>
    </ul>
  </div>

  <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px;">
    You're receiving this because you joined the Repurpose waitlist at nova-labs.dev.<br>
    Nova Labs — An AI-first business experiment by AckNova Automations.<br>
    To unsubscribe, reply with "unsubscribe".
  </p>
</body>
</html>`;

  // Notify ourselves
  const notifyHtml = `<p>New waitlist signup: <strong>${email}</strong><br>Source: ${safeSource}</p>`;

  try {
    await Promise.all([
      transporter.sendMail({
        from: '"Nova Labs" <support@nova-labs.dev>',
        to: email,
        subject: "You're on the Repurpose waitlist",
        html: htmlBody,
        text: `You're on the Repurpose waitlist.\n\nThanks for signing up. We'll send early access when we launch — plus a demo using your actual content.\n\nReply to this email with a blog post URL and we'll run it through our prototype and send you the output.\n\nNova Labs — nova-labs.dev`,
      }),
      transporter.sendMail({
        from: '"Nova Labs Bot" <support@nova-labs.dev>',
        to: "support@nova-labs.dev",
        subject: `[Repurpose waitlist] ${email}`,
        html: notifyHtml,
        text: `New waitlist signup: ${email}\nSource: ${safeSource}`,
      }),
    ]);

    return new Response(
      JSON.stringify({ success: true, message: "Waitlist confirmed" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("SMTP error:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config = {
  path: "/api/waitlist",
};
