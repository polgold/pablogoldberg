/**
 * Contact form API: saves to Supabase contact_messages, then sends email via SMTP.
 * For emails to arrive, set in .env / production:
 *   SMTP_HOST, SMTP_USER, SMTP_PASS
 * Optional: SMTP_PORT (default 587), SMTP_FROM, SMTP_TO (default hola@pablogoldberg.com), SMTP_SECURE (true for 465).
 * If SMTP is missing or fails, the message is still saved; response includes emailSent: boolean.
 */
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_TO_EMAIL = "hola@pablogoldberg.com";

type Body = {
  name?: string;
  contact?: string;
  message?: string;
  website?: string; // honeypot
};

function buildEmailHtml(name: string, contact: string, message: string, timestamp: string): string {
  return [
    "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>",
    "<p><strong>Contact:</strong> " + escapeHtml(contact) + "</p>",
    "<p><strong>Message:</strong></p><p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>",
    "<p style='color:#888;font-size:12px;'>" + escapeHtml(timestamp) + "</p>",
  ].join("");
}

function getSmtpConfig(): {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  secure: boolean;
  configured: boolean;
} {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user || "";
  const to = process.env.SMTP_TO?.trim() || DEFAULT_TO_EMAIL;
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;
  const configured = !!(host && user && pass);
  return { host: host || "", port: Number.isNaN(port) ? 587 : port, user: user || "", pass: pass || "", from, to, secure, configured };
}

async function sendViaSmtp(name: string, contact: string, message: string): Promise<boolean> {
  const cfg = getSmtpConfig();
  if (!cfg.configured) {
    console.warn(
      "[api/contact] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT, SMTP_FROM, SMTP_TO, SMTP_SECURE)."
    );
    return false;
  }
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  const timestamp = new Date().toISOString();
  const html = buildEmailHtml(name, contact, message, timestamp);
  try {
    await transporter.sendMail({
      from: cfg.from || cfg.user,
      to: cfg.to,
      subject: "New contact from pablogoldberg.com",
      html,
    });
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined;
    console.error("[api/contact] SMTP send failed:", msg, code ? `(code: ${code})` : "");
    return false;
  }
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const message = String(body.message ?? "").trim();
  const honeypot = String(body.website ?? "").trim();

  if (honeypot) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!name || !contact || !message) {
    return NextResponse.json(
      { error: "Name, contact and message are required" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email_or_whatsapp: contact,
      message,
    });
    if (error) {
      console.error("[api/contact] Supabase insert error:", error.message, error.code, error.details);
      return NextResponse.json(
        { error: "No se pudo guardar. Intenta más tarde." },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Error de conexión. Intenta más tarde." },
      { status: 500 }
    );
  }

  const sent = await sendViaSmtp(name, contact, message);
  if (!sent) {
    console.warn(
      "[api/contact] Email not sent (SMTP not configured or failed). Message saved to DB only. Check SMTP_* env vars and server logs."
    );
  }

  return NextResponse.json({ ok: true, emailSent: sent });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
