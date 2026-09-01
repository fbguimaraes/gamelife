import { createClient } from "@/lib/supabase/server";
import {
  addDays,
  evaluateDay,
  fetchActivitiesAndLogs,
  isoWeekdayOf,
  startOfDay,
} from "@/lib/day-consistency";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type NivelDia = "sem-dados" | "falho" | 1 | 2 | 3 | 4;

export type DiaHeatmap = {
  data: Date;
  nivel: NivelDia;
};

function nivelDoDia(applicable: number, completed: number): NivelDia {
  if (applicable === 0) return "sem-dados";
  const ratio = completed / applicable;
  if (ratio === 0) return "falho";
  if (ratio < 0.5) return 1;
  if (ratio < 0.75) return 2;
  if (ratio < 1) return 3;
  return 4;
}

/**
 * Monta a grade do heatmap de consistência (item 3.4), semanas x dias
 * (estilo GitHub), começando na segunda-feira da semana mais antiga exibida
 * e terminando hoje. Reaproveita a mesma regra de aplicabilidade por dia do
 * streak (item 2.5) via src/lib/day-consistency.ts — o heatmap mostra
 * literalmente os mesmos dias que contam ou não para o streak.
 */
export async function buildHeatmapData(
  supabase: SupabaseServerClient,
  semanas: number
): Promise<DiaHeatmap[][]> {
  const { activities, logDaysByActivity } = await fetchActivitiesAndLogs(
    supabase
  );

  const hoje = startOfDay(new Date());
  const inicioSemanaAtual = addDays(hoje, -(isoWeekdayOf(hoje) - 1));
  const inicioGrade = addDays(inicioSemanaAtual, -(semanas - 1) * 7);

  const grade: DiaHeatmap[][] = [];
  for (let semana = 0; semana < semanas; semana++) {
    const dias: DiaHeatmap[] = [];
    for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
      const data = addDays(inicioGrade, semana * 7 + diaSemana);

      if (data.getTime() > hoje.getTime()) {
        dias.push({ data, nivel: "sem-dados" });
        continue;
      }

      const { applicable, completed } = evaluateDay(
        data,
        activities,
        logDaysByActivity
      );
      dias.push({ data, nivel: nivelDoDia(applicable, completed) });
    }
    grade.push(dias);
  }

  return grade;
}
