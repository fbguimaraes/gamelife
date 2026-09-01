import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ActivityRow } from "./ActivityRow";

const PESO_LABEL: Record<string, string> = {
  leve: "Leve",
  medio: "Médio",
  dificil: "Difícil",
};

const DIA_LABEL: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  7: "Dom",
};

function frequenciaLabel(activity: {
  frequencia: string;
  dias_semana: number[] | null;
}) {
  if (activity.frequencia === "diaria") return "Diária";
  if (activity.frequencia === "unica") return "Pontual";
  const dias = (activity.dias_semana ?? []).map((d) => DIA_LABEL[d]).join(", ");
  return dias ? `Dias específicos (${dias})` : "Dias específicos";
}

export default async function AtividadesPage() {
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("id, titulo, categoria, frequencia, dias_semana, peso, ativa")
    .order("criado_em", { ascending: false });

  const ativas = (activities ?? []).filter((a) => a.ativa);
  const arquivadas = (activities ?? []).filter((a) => !a.ativa);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Atividades
        </h1>
        <Link href="/atividades/nova" className={buttonVariants({ variant: "default" })}>
          Nova atividade
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        {ativas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade cadastrada ainda.{" "}
            <Link
              href="/atividades/nova"
              className="text-foreground underline underline-offset-4"
            >
              Criar a primeira
            </Link>
            .
          </p>
        ) : (
          ativas.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              pesoLabel={PESO_LABEL[activity.peso]}
              frequenciaLabel={frequenciaLabel(activity)}
            />
          ))
        )}
      </section>

      {arquivadas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-medium text-foreground">
            Arquivadas
          </h2>
          {arquivadas.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              pesoLabel={PESO_LABEL[activity.peso]}
              frequenciaLabel={frequenciaLabel(activity)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
