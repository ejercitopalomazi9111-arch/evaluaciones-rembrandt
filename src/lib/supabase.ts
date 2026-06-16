import { createClient } from "@supabase/supabase-js";

// Las variables NEXT_PUBLIC_* se inyectan al compilar. Se usa un valor de
// respaldo para que `next build` no falle cuando aún no están configuradas;
// en producción debes definirlas (Vercel → Project → Settings → Environment).
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";

export const supabase = createClient(url, anon);

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Mensajes de error de los RPC del servidor → texto para el aspirante. */
export function rpcMessage(err: { message?: string } | null): string {
  const m = err?.message || "";
  if (m.includes("CODE_INVALID")) return "Código no válido. Verifícalo con Coordinación.";
  if (m.includes("CODE_USED")) return "Este examen ya fue contestado con este código.";
  if (m.includes("NO_QUESTIONS")) return "Aún no hay preguntas configuradas. Avisa a Coordinación.";
  return m || "Ocurrió un error. Intenta de nuevo.";
}
