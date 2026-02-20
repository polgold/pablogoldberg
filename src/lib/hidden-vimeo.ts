import { createSupabaseServerClient } from "./supabase/server";

/** Normalize to digits-only so comparison with Vimeo API ids is reliable. */
function normalizeId(raw: string): string {
  return String(raw ?? "").trim().replace(/\D/g, "");
}

export async function getHiddenVimeoIds(): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hidden-vimeo] SUPABASE_SERVICE_ROLE_KEY not set; no videos will be hidden on /work.");
    }
    return new Set();
  }
  const { data, error } = await supabase.from("hidden_vimeo_ids").select("vimeo_id");
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[hidden-vimeo] getHiddenVimeoIds error:", error.message);
    }
    return new Set();
  }
  const ids = (data ?? []).map((r) => normalizeId(String(r.vimeo_id ?? ""))).filter(Boolean);
  return new Set(ids);
}

export async function getCustomVimeoIds(): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return new Set();
  try {
    const { data, error } = await supabase.from("custom_vimeo_ids").select("vimeo_id");
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[hidden-vimeo] getCustomVimeoIds error:", error.message);
      }
      return new Set();
    }
    const ids = (data ?? []).map((r) => normalizeId(String(r.vimeo_id ?? ""))).filter(Boolean);
    return new Set(ids);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[hidden-vimeo] getCustomVimeoIds exception:", e);
    }
    return new Set();
  }
}
