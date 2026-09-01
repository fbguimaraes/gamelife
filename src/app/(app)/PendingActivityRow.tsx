"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showUndoToast } from "@/components/undo-toast";
import { completeActivity, uncompleteActivity } from "./actions";
import { cn } from "@/lib/utils";

// Duração do único momento de animação orquestrado do produto (item 2.7,
// CLAUDE.md Seção 4) — dá tempo do usuário ver o feedback antes da
// revalidação do servidor mover a atividade para "Concluídas".
const FEEDBACK_DURATION_MS = 550;

export function PendingActivityRow({
  activityId,
  titulo,
  categoria,
  pesoLabel,
}: {
  activityId: string;
  titulo: string;
  categoria: string;
  pesoLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [concluindo, setConcluindo] = useState(false);

  function handleConcluir() {
    setConcluindo(true);
    setTimeout(() => {
      startTransition(async () => {
        const resultado = await completeActivity(activityId);
        showUndoToast({
          message: resultado?.mensagem ?? `"${titulo}" concluída.`,
          onUndo: () => {
            uncompleteActivity(activityId).catch((err) => {
              console.error("Falha ao desfazer conclusão:", err);
            });
          },
        });
      });
    }, FEEDBACK_DURATION_MS);
  }

  return (
    <div
      data-testid="pending-activity-row"
      data-titulo={titulo}
      className={cn(
        "flex items-center justify-between gap-4 rounded-md border px-4 py-3 transition-all ease-out motion-reduce:transition-none",
        concluindo
          ? "border-primary bg-accent opacity-0 scale-[0.98] duration-500"
          : "border-border bg-surface opacity-100 scale-100 duration-200"
      )}
    >
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "text-sm font-medium text-foreground transition-all duration-300 motion-reduce:transition-none",
            concluindo && "text-muted-foreground line-through"
          )}
        >
          {titulo}
        </p>
        <p className="text-sm text-muted-foreground">
          {categoria}, {pesoLabel}
        </p>
      </div>

      {concluindo ? (
        <span className="flex h-8 w-8 shrink-0 animate-in zoom-in-50 items-center justify-center rounded-full bg-primary text-primary-foreground duration-300 motion-reduce:animate-none">
          <Check className="h-4 w-4" />
        </span>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={handleConcluir}
        >
          Concluir
        </Button>
      )}
    </div>
  );
}
