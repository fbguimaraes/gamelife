import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildHeatmapData } from "@/lib/heatmap";
import { pontosParaProximoNivel } from "@/lib/nivel";
import { Heatmap } from "./Heatmap";

const SEMANAS_HEATMAP = 16;

export default async function ProgressoPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: user } = await supabase
    .from("users")
    .select("pontos_totais, nivel, streak_atual, streak_freezes_disponiveis")
    .eq("id", userData.user.id)
    .single();

  const { data: recentes } = await supabase
    .from("user_achievements")
    .select("desbloqueada_em, achievements(titulo)")
    .eq("user_id", userData.user.id)
    .order("desbloqueada_em", { ascending: false })
    .limit(5);

  const semanas = await buildHeatmapData(supabase, SEMANAS_HEATMAP);

  const pontosTotais = user?.pontos_totais ?? 0;
  const { faltam, proximoNivelMin } = pontosParaProximoNivel(pontosTotais);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Progresso
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted-foreground">Pontos</p>
          <p className="font-heading text-2xl text-foreground">
            {pontosTotais}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted-foreground">Nível</p>
          <p className="font-heading text-2xl text-foreground">
            {user?.nivel ?? 1}
          </p>
          <p className="text-sm text-muted-foreground">
            Faltam {faltam} para o nível {Math.floor(proximoNivelMin / 100) + 1}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted-foreground">Streak atual</p>
          <p className="font-heading text-2xl text-foreground">
            {user?.streak_atual ?? 0}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted-foreground">Freezes disponíveis</p>
          <p className="font-heading text-2xl text-foreground">
            {user?.streak_freezes_disponiveis ?? 0}
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium text-foreground">
          Consistência
        </h2>
        <Heatmap semanas={semanas} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium text-foreground">
          Conquistas recentes
        </h2>
        {!recentes || recentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma conquista desbloqueada ainda. Continue cumprindo suas
            atividades para desbloquear a primeira — veja{" "}
            <Link
              href="/conquistas"
              className="text-foreground underline underline-offset-4"
            >
              o que está disponível
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentes.map((r, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-surface px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground">
                  {(r.achievements as unknown as { titulo: string } | null)
                    ?.titulo ?? "Conquista"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(r.desbloqueada_em))}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
