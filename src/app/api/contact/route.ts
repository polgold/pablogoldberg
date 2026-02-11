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

async function sendViaSmtp(name: string, contact: string, message: string): Promise<boolean> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;
  const to = process.env.SMTP_TO?.trim() || DEFAULT_TO_EMAIL;
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;
  if (!host || !user || !pass) return false;
  const transporter = nodemailer.createTransport({
    host,
    port: Number.isNaN(port) ? 587 : port,
    secure,
    auth: { user, pass },
  });
  const timestamp = new Date().toISOString();
  const html = buildEmailHtml(name, contact, message, timestamp);
  try {
    await transporter.sendMail({
      from: from || user,
      to,
      subject: "New contact from pablogoldberg.com",
      html,
    });
    return true;
  } catch (err) {
    console.error("[api/contact] SMTP error:", err);
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
      "[api/contact] SMTP not configured or failed. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM. Message saved to DB only."
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
