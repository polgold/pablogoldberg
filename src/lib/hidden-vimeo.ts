import { createSupabaseServerClient } from "./supabase/server";

export async function getHiddenVimeoIds(): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return new Set();
  const { data } = await supabase.from("hidden_vimeo_ids").select("vimeo_id");
  const ids = (data ?? []).map((r) => String(r.vimeo_id ?? "").trim()).filter(Boolean);
  return new Set(ids);
}
