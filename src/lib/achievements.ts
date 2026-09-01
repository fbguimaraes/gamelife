import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Verifica as conquistas ainda não desbloqueadas do usuário contra o estado
 * atual (streak e total de atividades concluídas) e desbloqueia as que
 * atingiram o critério — item 3.2. Critérios são definidos na migração de
 * seed (supabase/migrations/20260901000003_seed_achievements.sql) e em
 * CLAUDE.md Seção 7, no formato `streak_N` ou `atividades_N`.
 *
 * Conquistas nunca são "retrancadas": mesmo que um streak quebre ou uma
 * conclusão seja desfeita depois de desbloquear uma conquista, ela
 * permanece desbloqueada (não há remoção de user_achievements em nenhum
 * lugar do código) — consistente com o conceito de "marco" já alcançado.
 *
 * Retorna as conquistas recém-desbloqueadas nesta chamada (para o toast de
 * incentivo poder mencioná-las, se aplicável).
 */
export async function checkAndUnlockAchievements(
  supabase: SupabaseServerClient,
  userId: string,
  streakAtual: number
) {
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, titulo, criterio");

  if (!achievements || achievements.length === 0) return [];

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set((unlocked ?? []).map((u) => u.achievement_id));
  const pendentes = achievements.filter((a) => !unlockedIds.has(a.id));
  if (pendentes.length === 0) return [];

  const { count: totalAtividades } = await supabase
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const novasConquistas: { id: string; titulo: string }[] = [];

  for (const achievement of pendentes) {
    const [chave, valorStr] = achievement.criterio.split("_");
    const valor = Number(valorStr);
    if (!chave || Number.isNaN(valor)) continue;

    const atingiu =
      (chave === "streak" && streakAtual >= valor) ||
      (chave === "atividades" && (totalAtividades ?? 0) >= valor);

    if (atingiu) {
      novasConquistas.push({ id: achievement.id, titulo: achievement.titulo });
    }
  }

  if (novasConquistas.length === 0) return [];

  await supabase.from("user_achievements").insert(
    novasConquistas.map((a) => ({
      user_id: userId,
      achievement_id: a.id,
    }))
  );

  return novasConquistas;
}
