"use client";

import { useState } from "react";

const WHATSAPP_URL = "https://wa.me/5491136511204";

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();

    if (website) {
      setError("Invalid request.");
      setSending(false);
      return;
    }
    if (!name || !contact || !message) {
      setError("Completa todos los campos.");
      setSending(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message, website }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error || "No se pudo enviar. Intenta más tarde.");
        return;
      }
      setSuccess(true);
      form.reset();
    } catch {
      setError("No se pudo enviar. Intenta más tarde.");
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-white/90">Mensaje enviado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-wider text-white/60">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={sending}
            className="w-full rounded border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none disabled:opacity-60"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="contact" className="mb-1 block text-xs uppercase tracking-wider text-white/60">
            Contacto
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            required
            disabled={sending}
            className="w-full rounded border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none disabled:opacity-60"
            placeholder="Email o WhatsApp"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-xs uppercase tracking-wider text-white/60">
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            required
            disabled={sending}
            rows={4}
            className="w-full rounded border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none resize-y min-h-[120px] disabled:opacity-60"
            placeholder="Cuéntame sobre tu proyecto..."
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded border border-white/30 bg-white/10 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </form>
      <p className="text-center text-xs text-white/50">o escribe directo por WhatsApp</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded border border-white/20 bg-black py-3 text-sm text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        WhatsApp
      </a>
    </div>
  );
}
