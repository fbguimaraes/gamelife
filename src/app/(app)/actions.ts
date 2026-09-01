"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Janela de tempo permitida para desmarcar uma conclusão (item 2.3),
// definida pelo usuário: 15 segundos, sincronizada com o toast de desfazer
// em src/components/undo-toast.tsx.
const UNDO_WINDOW_MS = 15_000;

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
    const { error } = await supabase.from("activity_logs").insert({
      activity_id: activityId,
      user_id: userData.user.id,
      // Cálculo real de pontos por peso é o item 2.4 (ainda não implementado).
      pontos_ganhos: 0,
    });

    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function uncompleteActivity(activityId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const cutoff = new Date(Date.now() - UNDO_WINDOW_MS);

  const { error } = await supabase
    .from("activity_logs")
    .delete()
    .eq("activity_id", activityId)
    .eq("user_id", userData.user.id)
    .gte("concluida_em", cutoff.toISOString());

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
