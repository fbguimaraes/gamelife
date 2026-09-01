import Link from "next/link";
import { toggleArchiveActivity } from "./actions";
import { Button } from "@/components/ui/button";
import { DeleteActivityForm } from "./DeleteActivityForm";

export function ActivityRow({
  activity,
  pesoLabel,
  frequenciaLabel,
}: {
  activity: { id: string; titulo: string; categoria: string; ativa: boolean };
  pesoLabel: string;
  frequenciaLabel: string;
}) {
  return (
    <div
      data-testid="activity-row"
      data-titulo={activity.titulo}
      className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{activity.titulo}</p>
        <p className="text-sm text-muted-foreground">
          {activity.categoria}, {frequenciaLabel}, {pesoLabel}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/atividades/${activity.id}/editar`}
          className="text-sm text-foreground underline underline-offset-4"
        >
          Editar
        </Link>
        <form action={toggleArchiveActivity.bind(null, activity.id, !activity.ativa)}>
          <Button type="submit" variant="secondary" size="sm">
            {activity.ativa ? "Arquivar" : "Reativar"}
          </Button>
        </form>
        <DeleteActivityForm activityId={activity.id} titulo={activity.titulo} />
      </div>
    </div>
  );
}
