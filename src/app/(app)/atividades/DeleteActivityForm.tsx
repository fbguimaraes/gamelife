"use client";

import { deleteActivity } from "./actions";
import { Button } from "@/components/ui/button";

export function DeleteActivityForm({
  activityId,
  titulo,
}: {
  activityId: string;
  titulo: string;
}) {
  return (
    <form
      action={deleteActivity.bind(null, activityId)}
      onSubmit={(event) => {
        if (!confirm(`Excluir "${titulo}" permanentemente?`)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        Excluir
      </Button>
    </form>
  );
}
