import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActivityForm } from "../../ActivityForm";
import { updateActivity } from "../../actions";

export default async function EditarAtividadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("id, titulo, descricao, categoria, frequencia, dias_semana, peso")
    .eq("id", id)
    .single();

  if (!activity) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Editar atividade
      </h1>
      <ActivityForm
        action={updateActivity.bind(null, activity.id)}
        defaultValues={activity}
        submitLabel="Salvar alterações"
        pendingLabel="Salvando..."
      />
    </div>
  );
}
