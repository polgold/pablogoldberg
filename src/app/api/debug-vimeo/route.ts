/**
 * Diagnóstico Vimeo: verifica token y respuesta de la API.
 * GET /api/debug-vimeo — útil para depurar por qué no se muestran videos.
 * ELIMINAR en producción cuando ya funcione.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.VIMEO_ACCESS_TOKEN?.trim() || null;
  const hasToken = Boolean(token);

  if (!hasToken) {
    return NextResponse.json({
      ok: false,
      error: "VIMEO_ACCESS_TOKEN no está definido o está vacío",
      hint: "Verificá que la variable exista en Hostinger y que hayas hecho redeploy después de añadirla.",
    });
  }

  try {
    const res = await fetch("https://api.vimeo.com/me/videos?per_page=3&sort=date", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `Vimeo API respondió ${res.status}`,
        vimeoError: json.error || json.message || json,
        hint:
          res.status === 401
            ? "Token inválido o expirado. Generá uno nuevo en developer.vimeo.com/apps"
            : res.status === 403
              ? "El token no tiene permisos para listar videos"
              : "Revisá la respuesta de Vimeo arriba",
      });
    }

    const data = json.data ?? [];
    return NextResponse.json({
      ok: true,
      tokenPresent: true,
      videoCount: data.length,
      sample: data.slice(0, 2).map((v: { uri?: string; name?: string }) => ({
        uri: v.uri,
        name: v.name,
      })),
      message: "Vimeo OK. Si /work sigue vacío, puede ser caché o que hidden_vimeo_ids oculte todos.",
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return NextResponse.json({
      ok: false,
      error: "Error al llamar a Vimeo API",
      message: err.message,
      hint: "Hostinger podría estar bloqueando requests salientes a api.vimeo.com. Probá desde otro entorno.",
    });
  }
}
