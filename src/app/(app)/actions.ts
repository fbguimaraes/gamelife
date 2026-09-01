"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Janela de tempo permitida para desmarcar uma conclusão (item 2.3),
// definida pelo usuário: 15 segundos, sincronizada com o toast de desfazer
// em src/components/undo-toast.tsx.
const UNDO_WINDOW_MS = 15_000;

// Pontos por peso (item 2.4), definidos pelo usuário.
const PONTOS_POR_PESO: Record<string, number> = {
  leve: 5,
  medio: 10,
  dificil: 20,
};

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function completeActivity(activityId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { start, end } = todayRange();

  const { data: existing } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("activity_id", activityId)
    .gte("concluida_em", start.toISOString())
    .lt("concluida_em", end.toISOString())
    .limit(1);

  if (!existing || existing.length === 0) {
    const { data: activity } = await supabase
      .from("activities")
      .select("peso")
      .eq("id", activityId)
      .single();

    const pontosGanhos = activity ? PONTOS_POR_PESO[activity.peso] : 0;

    const { error } = await supabase.from("activity_logs").insert({
      activity_id: activityId,
      user_id: userData.user.id,
      pontos_ganhos: pontosGanhos,
    });

    if (error) throw new Error(error.message);

    const { data: user } = await supabase
      .from("users")
      .select("pontos_totais")
      .eq("id", userData.user.id)
      .single();

    if (user) {
      await supabase
        .from("users")
        .update({ pontos_totais: user.pontos_totais + pontosGanhos })
        .eq("id", userData.user.id);
    }
  }

  revalidatePath("/");
}

export async function uncompleteActivity(activityId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const cutoff = new Date(Date.now() - UNDO_WINDOW_MS);

  const { data: deleted, error } = await supabase
    .from("activity_logs")
    .delete()
    .eq("activity_id", activityId)
    .eq("user_id", userData.user.id)
    .gte("concluida_em", cutoff.toISOString())
    .select("pontos_ganhos");

  if (error) throw new Error(error.message);

  const pontosRevertidos = (deleted ?? []).reduce(
    (soma, log) => soma + log.pontos_ganhos,
    0,
  );

  if (pontosRevertidos > 0) {
    const { data: user } = await supabase
      .from("users")
      .select("pontos_totais")
      .eq("id", userData.user.id)
      .single();

    if (user) {
      await supabase
        .from("users")
        .update({ pontos_totais: user.pontos_totais - pontosRevertidos })
        .eq("id", userData.user.id);
    }
  }

  revalidatePath("/");
}
