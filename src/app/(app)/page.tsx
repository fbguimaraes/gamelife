import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PendingActivityRow } from "./PendingActivityRow";

const PESO_LABEL: Record<string, string> = {
  leve: "Leve",
  medio: "Médio",
  dificil: "Difícil",
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function MeuDiaPage() {
  const now = new Date();
  const isoWeekday = now.getDay() === 0 ? 7 : now.getDay();

  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("id, titulo, categoria, peso, frequencia, dias_semana")
    .eq("ativa", true);

  const temAtividadesCadastradas = (activities ?? []).length > 0;

  const aplicaveisHoje = (activities ?? []).filter((activity) => {
    if (activity.frequencia === "diaria") return true;
    if (activity.frequencia === "dias_especificos")
      return (activity.dias_semana ?? []).includes(isoWeekday);
    return true; // 'unica' — filtrada abaixo, conforme conclusão registrada
  });

  const activityIds = aplicaveisHoje.map((activity) => activity.id);
  const { data: logs } = activityIds.length
    ? await supabase
        .from("activity_logs")
        .select("activity_id, concluida_em")
        .in("activity_id", activityIds)
    : { data: [] as { activity_id: string; concluida_em: string }[] };

  const pendentes: typeof aplicaveisHoje = [];
  const concluidas: typeof aplicaveisHoje = [];

  for (const activity of aplicaveisHoje) {
    const activityLogs = (logs ?? []).filter(
      (log) => log.activity_id === activity.id
    );

    if (activity.frequencia === "unica") {
      if (activityLogs.length > 0) continue; // já concluída — some da tela do dia
      pendentes.push(activity);
      continue;
    }

    const concluidaHoje = activityLogs.some((log) =>
      isSameDay(new Date(log.concluida_em), now)
    );
    (concluidaHoje ? concluidas : pendentes).push(activity);
  }

  const dataFormatadaBruta = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const dataFormatada =
    dataFormatadaBruta.charAt(0).toUpperCase() + dataFormatadaBruta.slice(1);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Meu Dia
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{dataFormatada}</p>
      </div>

      {aplicaveisHoje.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {temAtividadesCadastradas ? (
            <>
              Nenhuma das suas atividades está programada para hoje. Confira{" "}
              <Link
                href="/atividades"
                className="text-foreground underline underline-offset-4"
              >
                suas atividades
              </Link>{" "}
              para ver quando elas acontecem.
            </>
          ) : (
            <>
              Você ainda não cadastrou nenhuma atividade.{" "}
              <Link
                href="/atividades/nova"
                className="text-foreground underline underline-offset-4"
              >
                Cadastrar a primeira
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-medium text-foreground">
              Pendentes
            </h2>
            {pendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tudo cumprido por hoje.
              </p>
            ) : (
              pendentes.map((activity) => (
                <PendingActivityRow
                  key={activity.id}
                  activityId={activity.id}
                  titulo={activity.titulo}
                  categoria={activity.categoria}
                  pesoLabel={PESO_LABEL[activity.peso]}
                />
              ))
            )}
          </section>

          {concluidas.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-medium text-foreground">
                Concluídas
              </h2>
              {concluidas.map((activity) => (
                <div
                  key={activity.id}
                  data-testid="completed-activity-row"
                  data-titulo={activity.titulo}
                  className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3 opacity-70"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground line-through">
                      {activity.titulo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.categoria}, {PESO_LABEL[activity.peso]}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
