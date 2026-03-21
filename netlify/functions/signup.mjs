import nodemailer from "nodemailer";

export default async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let email;
  try {
    const body = await req.json();
    email = body.email;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ error: "Valid email required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Send confirmation email with download link
  const transporter = nodemailer.createTransport({
    host: "smtp.porkbun.com",
    port: 587,
    secure: false,
    auth: {
      user: "support@nova-labs.dev",
      pass: process.env.SUPPORT_MAIL_PASSWORD,
    },
  });

  const downloadUrl = "https://nova-labs.dev/AI-OS-Blueprint-Free-Preview.pdf";
  const playbookUrl = "https://nova-labs.dev/#pricing";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #e0e0e0; background-color: #0a0a0f;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a78bfa; margin: 0;">Nova<span style="color: #888;">Labs</span></h1>
  </div>

  <h2 style="color: #f0f0f0;">Your free AI OS preview is ready</h2>

  <p>Thanks for your interest in the AI OS Blueprint. Here are your free chapters:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${downloadUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Chapters 1 & 2 (PDF)</a>
  </div>

  <p><strong>What you'll learn:</strong></p>
  <ul style="color: #ccc; line-height: 1.8;">
    <li>Why 95% of founders waste their AI potential</li>
    <li>The difference between "using AI" and "having an AI system"</li>
    <li>The 6 building blocks of every AI Operating System</li>
    <li>A visual architecture diagram you can reference while building</li>
  </ul>

  <div style="margin: 30px 0; padding: 20px; border: 1px solid #333; border-radius: 8px; background-color: #111;">
    <p style="margin: 0 0 10px 0; font-weight: bold; color: #f0f0f0;">Ready for the full system?</p>
    <p style="margin: 0 0 15px 0; color: #aaa;">The complete playbook has 12 chapters, 5 premium skills, and a ready-to-clone AI OS repo.</p>
    <a href="${playbookUrl}" style="color: #a78bfa; text-decoration: underline;">See pricing and get the full playbook</a>
  </div>

  <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px;">
    You're receiving this because you requested the free AI OS Blueprint preview from nova-labs.dev.<br>
    Nova Labs - An AI-first business experiment by AckNova Automations.
  </p>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: '"Nova Labs" <support@nova-labs.dev>',
      to: email,
      subject: "Your free AI OS Blueprint preview",
      html: htmlBody,
      text: `Your free AI OS preview is ready!\n\nDownload chapters 1 & 2 here: ${downloadUrl}\n\nReady for the full system? See pricing: ${playbookUrl}\n\nNova Labs - An AI-first business experiment by AckNova Automations.`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent" }),
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
  path: "/api/signup",
};
