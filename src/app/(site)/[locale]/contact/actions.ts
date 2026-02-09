"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ContactFormState = { ok: boolean; error?: string };

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const emailOrWhatsapp = String(formData.get("email_or_whatsapp") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !emailOrWhatsapp || !message) {
    return { ok: false, error: "Completa todos los campos." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Error de conexión. Intenta más tarde." };
  }

  const { error } = await supabase.from("contact_submissions").insert({
    name,
    email_or_whatsapp: emailOrWhatsapp,
    message,
  });

  if (error) {
    console.error("[contact] submit error:", error.message);
    return { ok: false, error: "No se pudo enviar. Intenta más tarde." };
  }
  return { ok: true };
}
