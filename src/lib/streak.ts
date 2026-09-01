import { createClient } from "@/lib/supabase/server";
import {
  addDays,
  evaluateDay,
  fetchActivitiesAndLogs,
  isoWeekdayOf,
  startOfDay,
  type Activity,
} from "@/lib/day-consistency";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Streak freeze (item 2.6), definido pelo usuário: 1 perdão por semana,
// reabastecido toda segunda-feira (não acumula entre semanas).
export const MAX_FREEZES_POR_SEMANA = 1;

export function inicioDaSemana(date: Date) {
  return addDays(date, -(isoWeekdayOf(date) - 1)); // segunda-feira daquela semana
}

/**
 * Núcleo puro do cálculo de streak (sem I/O) — separado de
 * `recalculateStreak` para ser testável com Vitest sem precisar de um
 * banco de dados real (item 4.3).
 *
 * Regra (definida pelo usuário para o item 2.5): um dia conta como cumprido
 * se pelo menos 50% das atividades aplicáveis daquele dia foram concluídas.
 * Dias sem nenhuma atividade aplicável são neutros (não somam nem quebram
 * o streak). O dia de hoje nunca quebra o streak por estar incompleto,
 * já que ainda não terminou.
 *
 * Regra (item 2.6): quando um dia passado não atinge os 50%, o streak freeze
 * é aplicado automaticamente se ainda houver 1 disponível naquela semana
 * (segunda a domingo) — o dia passa a contar como cumprido em vez de
 * quebrar a sequência, e o freeze daquela semana é consumido.
 */
export function computeStreak({
  activities,
  logDaysByActivity,
  accountCreatedDay,
  hoje,
}: {
  activities: Activity[];
  logDaysByActivity: Map<string, Date[]>;
  accountCreatedDay: Date;
  hoje: Date;
}): { streakAtual: number; freezesDisponiveis: number } {
  if (activities.length === 0) {
    return { streakAtual: 0, freezesDisponiveis: MAX_FREEZES_POR_SEMANA };
  }

  let streak = 0;
  let day = hoje;
  let isToday = true;
  const freezesUsadosPorSemana = new Map<number, number>();

  while (day.getTime() >= accountCreatedDay.getTime()) {
    const { applicable, completed } = evaluateDay(
      day,
      activities,
      logDaysByActivity
    );

    if (applicable === 0) {
      day = addDays(day, -1);
      isToday = false;
      continue;
    }

    const diaCumprido = completed * 2 >= applicable;

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

    const semana = inicioDaSemana(day).getTime();
    const freezesUsados = freezesUsadosPorSemana.get(semana) ?? 0;

    if (freezesUsados < MAX_FREEZES_POR_SEMANA) {
      freezesUsadosPorSemana.set(semana, freezesUsados + 1);
      streak++;
      day = addDays(day, -1);
      isToday = false;
      continue;
    }

    break;
  }

  const semanaAtual = inicioDaSemana(hoje).getTime();
  const freezesUsadosSemanaAtual = freezesUsadosPorSemana.get(semanaAtual) ?? 0;
  const freezesDisponiveis = Math.max(
    0,
    MAX_FREEZES_POR_SEMANA - freezesUsadosSemanaAtual
  );

  return { streakAtual: streak, freezesDisponiveis };
}

/**
 * Recalcula o streak geral do usuário a partir do histórico de activity_logs
 * e grava o resultado em users.streak_atual / users.streak_freezes_disponiveis.
 * Wrapper de I/O em torno de `computeStreak` (lógica pura, testada separadamente).
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
  const hoje = startOfDay(new Date());

  const { activities, logDaysByActivity } = await fetchActivitiesAndLogs(
    supabase
  );

  const resultado = computeStreak({
    activities,
    logDaysByActivity,
    accountCreatedDay,
    hoje,
  });

  await supabase
    .from("users")
    .update({
      streak_atual: resultado.streakAtual,
      streak_freezes_disponiveis: resultado.freezesDisponiveis,
    })
    .eq("id", userId);

  return resultado;
}
