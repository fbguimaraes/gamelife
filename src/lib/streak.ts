import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

function isoWeekdayOf(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

/**
 * Recalcula o streak geral do usuário a partir do histórico de activity_logs
 * e grava o resultado em users.streak_atual.
 *
 * Regra (definida pelo usuário para o item 2.5): um dia conta como cumprido
 * se pelo menos 50% das atividades aplicáveis daquele dia foram concluídas.
 * Dias sem nenhuma atividade aplicável são neutros (não somam nem quebram
 * o streak). O dia de hoje nunca quebra o streak por estar incompleto,
 * já que ainda não terminou.
 */
export async function recalculateStreak(
  supabase: SupabaseServerClient,
  userId: string
) {
  const { data: user } = await supabase
    .from("users")
    .select("criado_em")
    .eq("id", userId)
    .single();

  if (!user) return;

  const accountCreatedDay = startOfDay(new Date(user.criado_em));

  const { data: activities } = await supabase
    .from("activities")
    .select("id, frequencia, dias_semana, criado_em")
    .eq("ativa", true);

  if (!activities || activities.length === 0) {
    await supabase.from("users").update({ streak_atual: 0 }).eq("id", userId);
    return;
  }

  const activityIds = activities.map((activity) => activity.id);
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("activity_id, concluida_em")
    .in("activity_id", activityIds);

  const logDaysByActivity = new Map<string, Date[]>();
  for (const log of logs ?? []) {
    const day = startOfDay(new Date(log.concluida_em));
    const list = logDaysByActivity.get(log.activity_id) ?? [];
    list.push(day);
    logDaysByActivity.set(log.activity_id, list);
  }
  for (const list of logDaysByActivity.values()) {
    list.sort((a, b) => a.getTime() - b.getTime());
  }

  let streak = 0;
  let day = startOfDay(new Date());
  let isToday = true;

  while (day.getTime() >= accountCreatedDay.getTime()) {
    const isoWeekday = isoWeekdayOf(day);
    let applicableCount = 0;
    let completedCount = 0;

    for (const activity of activities) {
      const activityCreatedDay = startOfDay(new Date(activity.criado_em));
      if (day.getTime() < activityCreatedDay.getTime()) continue;

      const logDays = logDaysByActivity.get(activity.id) ?? [];

      if (activity.frequencia === "unica") {
        // 'unica' some da tela do dia por completo após a primeira conclusão
        // (decisão registrada no item 2.1) — só é aplicável em dias antes ou
        // no exato dia dessa conclusão.
        const firstLogDay = logDays[0];
        const applicable = !firstLogDay || firstLogDay.getTime() >= day.getTime();
        if (!applicable) continue;

        applicableCount++;
        if (firstLogDay && isSameDay(firstLogDay, day)) completedCount++;
        continue;
      }

      if (
        activity.frequencia === "dias_especificos" &&
        !(activity.dias_semana ?? []).includes(isoWeekday)
      ) {
        continue;
      }

      applicableCount++;
      if (logDays.some((logDay) => isSameDay(logDay, day))) completedCount++;
    }

    if (applicableCount === 0) {
      day = addDays(day, -1);
      isToday = false;
      continue;
    }

    const diaCumprido = completedCount * 2 >= applicableCount;

    if (diaCumprido) {
      streak++;
      day = addDays(day, -1);
      isToday = false;
      continue;
    }

    if (isToday) {
      day = addDays(day, -1);
      isToday = false;
      continue;
    }

    break;
  }

  await supabase
    .from("users")
    .update({ streak_atual: streak })
    .eq("id", userId);
}
