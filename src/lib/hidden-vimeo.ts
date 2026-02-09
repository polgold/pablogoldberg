import { createSupabaseServerClient } from "./supabase/server";

export async function getHiddenVimeoIds(): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return new Set();
  const { data } = await supabase.from("hidden_vimeo_ids").select("vimeo_id");
  const ids = (data ?? []).map((r) => String(r.vimeo_id ?? "").trim()).filter(Boolean);
  return new Set(ids);
}

export async function getCustomVimeoIds(): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return new Set();
  try {
    const { data, error } = await supabase.from("custom_vimeo_ids").select("vimeo_id");
    if (error) return new Set();
    const ids = (data ?? []).map((r) => String(r.vimeo_id ?? "").trim()).filter(Boolean);
    return new Set(ids);
  } catch {
    return new Set();
  }
}
