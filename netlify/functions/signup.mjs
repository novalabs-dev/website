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

  // Strict email validation: format check, length limit, no special characters
  // that could be used for header injection or prompt injection
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

  // Normalize to lowercase to prevent case-based bypass
  email = email.toLowerCase().trim();

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

  <h2 style="color: #f0f0f0;">Your AI OS Quick Start Guide is ready</h2>

  <p>You're 10 minutes away from a working AI skill that writes content in your voice. Not a chatbot. A system.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${downloadUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Quick Start Guide (PDF)</a>
  </div>

  <p><strong>What you'll build:</strong></p>
  <ul style="color: #ccc; line-height: 1.8;">
    <li>Your AI OS project structure (2 minutes)</li>
    <li>A context file that teaches AI your business and voice</li>
    <li>A content writing skill that produces posts as YOU</li>
    <li>A repeatable system you can extend to email, meetings, reviews</li>
  </ul>

  <div style="margin: 30px 0; padding: 20px; border: 1px solid #333; border-radius: 8px; background-color: #111;">
    <p style="margin: 0 0 10px 0; font-weight: bold; color: #f0f0f0;">Want more skills without building them yourself?</p>
    <p style="margin: 0 0 15px 0; color: #aaa;">The Skill Pack gives you 5 production-ready skills (content writer, email triage, meeting prep, daily planner, weekly review) for $9. Or get the full 12-chapter playbook with architecture deep-dives and a clone-ready repo.</p>
    <a href="${playbookUrl}" style="color: #a78bfa; text-decoration: underline;">See pricing and options</a>
  </div>

  <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px;">
    You're receiving this because you requested the AI OS Quick Start Guide from nova-labs.dev.<br>
    Nova Labs - An AI-first business experiment by AckNova Automations.
  </p>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: '"Nova Labs" <support@nova-labs.dev>',
      to: email,
      subject: "Your AI OS Quick Start Guide",
      html: htmlBody,
      text: `Your AI OS Quick Start Guide is ready!\n\nYou're 10 minutes away from a working AI skill. Download the guide: ${downloadUrl}\n\nWant more skills? See pricing: ${playbookUrl}\n\nNova Labs - An AI-first business experiment by AckNova Automations.`,
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
