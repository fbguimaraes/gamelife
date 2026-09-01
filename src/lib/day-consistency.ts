import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type Activity = {
  id: string;
  frequencia: string;
  dias_semana: number[] | null;
  criado_em: string;
};

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

export function isoWeekdayOf(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

/**
 * Busca as atividades ativas do usuário (RLS já restringe ao dono) e seus
 * activity_logs, no formato usado por evaluateDay — fonte compartilhada
 * entre o cálculo de streak (item 2.5/2.6) e o heatmap de consistência
 * (item 3.4), para as duas features usarem exatamente a mesma regra de
 * "o que era aplicável em cada dia".
 */
export async function fetchActivitiesAndLogs(supabase: SupabaseServerClient) {
  const { data: activities } = await supabase
    .from("activities")
    .select("id, frequencia, dias_semana, criado_em")
    .eq("ativa", true);

  const list: Activity[] = activities ?? [];
  if (list.length === 0) {
    return { activities: list, logDaysByActivity: new Map<string, Date[]>() };
  }

  const activityIds = list.map((activity) => activity.id);
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("activity_id, concluida_em")
    .in("activity_id", activityIds);

  const logDaysByActivity = new Map<string, Date[]>();
  for (const log of logs ?? []) {
    const day = startOfDay(new Date(log.concluida_em));
    const days = logDaysByActivity.get(log.activity_id) ?? [];
    days.push(day);
    logDaysByActivity.set(log.activity_id, days);
  }
  for (const days of logDaysByActivity.values()) {
    days.sort((a, b) => a.getTime() - b.getTime());
  }

  return { activities: list, logDaysByActivity };
}

/**
 * Para um dia específico, quantas atividades eram aplicáveis e quantas
 * foram concluídas — mesma regra usada em "Meu Dia" (item 2.1): `diaria`
 * sempre, `dias_especificos` conforme `dias_semana`, `unica` aplicável até
 * o dia da sua única conclusão (se houver), respeitando a data de criação
 * de cada atividade.
 */
export function evaluateDay(
  day: Date,
  activities: Activity[],
  logDaysByActivity: Map<string, Date[]>
) {
  const isoWeekday = isoWeekdayOf(day);
  let applicable = 0;
  let completed = 0;

  for (const activity of activities) {
    const activityCreatedDay = startOfDay(new Date(activity.criado_em));
    if (day.getTime() < activityCreatedDay.getTime()) continue;

    const logDays = logDaysByActivity.get(activity.id) ?? [];

    if (activity.frequencia === "unica") {
      const firstLogDay = logDays[0];
      const applicavel = !firstLogDay || firstLogDay.getTime() >= day.getTime();
      if (!applicavel) continue;

      applicable++;
      if (firstLogDay && isSameDay(firstLogDay, day)) completed++;
      continue;
    }

    if (
      activity.frequencia === "dias_especificos" &&
      !(activity.dias_semana ?? []).includes(isoWeekday)
    ) {
      continue;
    }

    applicable++;
    if (logDays.some((logDay) => isSameDay(logDay, day))) completed++;
  }

  return { applicable, completed };
}
