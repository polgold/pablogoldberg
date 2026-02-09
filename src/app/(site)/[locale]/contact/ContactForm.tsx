"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "./actions";

const WHATSAPP_URL = "https://wa.me/5491136511204";

export function ContactForm() {
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    (prev, formData) => submitContactForm(prev, formData),
    { ok: false }
  );

  if (state?.ok) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-white/90">Mensaje enviado. Te responderemos pronto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-wider text-white/60">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email_or_whatsapp" className="mb-1 block text-xs uppercase tracking-wider text-white/60">
            WhatsApp o email
          </label>
          <input
            id="email_or_whatsapp"
            name="email_or_whatsapp"
            type="text"
            required
            className="w-full rounded border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="+54 9 11 1234-5678 o tu@email.com"
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
            rows={4}
            className="w-full rounded border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none resize-y min-h-[120px]"
            placeholder="Cuéntame sobre tu proyecto..."
          />
        </div>
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          className="w-full rounded border border-white/30 bg-white/10 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Enviar
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
