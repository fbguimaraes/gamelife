"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActivityFormState = {
  error: string | null;
};

const FREQUENCIAS = ["diaria", "dias_especificos", "unica"] as const;
const PESOS = ["leve", "medio", "dificil"] as const;

function parseDiasSemana(formData: FormData): number[] {
  return formData
    .getAll("dias_semana")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
}

type ActivityPayload = {
  titulo: string;
  descricao: string | null;
  categoria: string;
  frequencia: string;
  peso: string;
  dias_semana: number[] | null;
};

type BuildActivityResult =
  | { ok: true; data: ActivityPayload }
  | { ok: false; error: string };

function buildActivityPayload(formData: FormData): BuildActivityResult {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const frequencia = String(formData.get("frequencia") ?? "");
  const peso = String(formData.get("peso") ?? "");
  const diasSemana = parseDiasSemana(formData);

  if (!titulo) return { ok: false, error: "Informe um título." };
  if (!categoria) return { ok: false, error: "Informe uma categoria." };
  if (!FREQUENCIAS.includes(frequencia as (typeof FREQUENCIAS)[number]))
    return { ok: false, error: "Selecione uma frequência válida." };
  if (!PESOS.includes(peso as (typeof PESOS)[number]))
    return { ok: false, error: "Selecione um peso válido." };
  if (frequencia === "dias_especificos" && diasSemana.length === 0)
    return { ok: false, error: "Selecione ao menos um dia da semana." };

  return {
    ok: true,
    data: {
      titulo,
      descricao: descricao || null,
      categoria,
      frequencia,
      peso,
      dias_semana: frequencia === "dias_especificos" ? diasSemana : null,
    },
  };
}

export async function createActivity(
  _prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  const result = buildActivityPayload(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase
    .from("activities")
    .insert({ ...result.data, user_id: userData.user.id });

  if (error) return { error: error.message };

  revalidatePath("/atividades");
  redirect("/atividades");
}

export async function updateActivity(
  activityId: string,
  _prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  const result = buildActivityPayload(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update(result.data)
    .eq("id", activityId);

  if (error) return { error: error.message };

  revalidatePath("/atividades");
  redirect("/atividades");
}

export async function toggleArchiveActivity(
  activityId: string,
  ativa: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({ ativa })
    .eq("id", activityId);

  if (error) throw new Error(error.message);
  revalidatePath("/atividades");
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) throw new Error(error.message);
  revalidatePath("/atividades");
}
