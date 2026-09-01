import { ActivityForm } from "../ActivityForm";
import { createActivity } from "../actions";

export default function NovaAtividadePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Nova atividade
      </h1>
      <ActivityForm
        action={createActivity}
        submitLabel="Criar atividade"
        pendingLabel="Criando..."
      />
    </div>
  );
}
