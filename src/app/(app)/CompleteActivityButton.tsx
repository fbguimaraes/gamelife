"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { showUndoToast } from "@/components/undo-toast";
import { completeActivity, uncompleteActivity } from "./actions";

export function CompleteActivityButton({
  activityId,
  titulo,
}: {
  activityId: string;
  titulo: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await completeActivity(activityId);
          showUndoToast({
            message: `"${titulo}" concluída.`,
            // Chamada direta (sem startTransition): quando o usuário clicar
            // em "Desfazer" no toast, esta linha da lista já terá sumido de
            // Pendentes e este componente pode já estar desmontado — a
            // Server Action precisa rodar de qualquer forma.
            onUndo: () => {
              uncompleteActivity(activityId).catch((err) => {
                console.error("Falha ao desfazer conclusão:", err);
              });
            },
          });
        });
      }}
    >
      {isPending ? "..." : "Concluir"}
    </Button>
  );
}
