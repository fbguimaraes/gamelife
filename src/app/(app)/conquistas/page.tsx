import { createClient } from "@/lib/supabase/server";

export default async function ConquistasPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, titulo, descricao");

  const { data: desbloqueadas } = userData.user
    ? await supabase
        .from("user_achievements")
        .select("achievement_id, desbloqueada_em")
        .eq("user_id", userData.user.id)
    : { data: [] as { achievement_id: string; desbloqueada_em: string }[] };

  const desbloqueadaPorId = new Map(
    (desbloqueadas ?? []).map((d) => [d.achievement_id, d.desbloqueada_em])
  );

  const lista = achievements ?? [];
  const dataFormatada = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Conquistas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {desbloqueadaPorId.size} de {lista.length} desbloqueadas.
        </p>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma conquista cadastrada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((achievement) => {
            const desbloqueadaEm = desbloqueadaPorId.get(achievement.id);
            const desbloqueada = Boolean(desbloqueadaEm);

            return (
              <div
                key={achievement.id}
                className={
                  desbloqueada
                    ? "flex flex-col gap-1 rounded-md border border-accent-warm bg-[color-mix(in_oklab,var(--accent-warm)_12%,var(--surface))] px-4 py-3"
                    : "flex flex-col gap-1 rounded-md border border-border bg-surface px-4 py-3 opacity-60"
                }
              >
                <p className="text-sm font-medium text-foreground">
                  {achievement.titulo}
                </p>
                <p className="text-sm text-muted-foreground">
                  {achievement.descricao}
                </p>
                {desbloqueadaEm && (
                  <p className="text-sm text-muted-foreground">
                    Desbloqueada em {dataFormatada(desbloqueadaEm)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
