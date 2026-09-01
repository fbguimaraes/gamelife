"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActivityFormState } from "./actions";

type Frequencia = "diaria" | "dias_especificos" | "unica";
type Peso = "leve" | "medio" | "dificil";

type ActivityDefaults = {
  titulo: string;
  descricao: string | null;
  categoria: string;
  frequencia: Frequencia;
  dias_semana: number[] | null;
  peso: Peso;
};

const DIAS: { value: number; label: string }[] = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

const PESOS: { value: Peso; label: string }[] = [
  { value: "leve", label: "Leve" },
  { value: "medio", label: "Médio" },
  { value: "dificil", label: "Difícil" },
];

const CATEGORIAS_SUGERIDAS = ["Saúde", "Trabalho", "Estudo", "Pessoal"];

const inputLikeClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ActivityForm({
  action,
  defaultValues,
  submitLabel,
  pendingLabel,
}: {
  action: (
    prevState: ActivityFormState,
    formData: FormData
  ) => Promise<ActivityFormState>;
  defaultValues?: ActivityDefaults;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
  });
  const [frequencia, setFrequencia] = useState<Frequencia>(
    defaultValues?.frequencia ?? "diaria"
  );
  const diasSelecionados = new Set(defaultValues?.dias_semana ?? []);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          defaultValue={defaultValues?.titulo}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          defaultValue={defaultValues?.descricao ?? ""}
          className={inputLikeClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoria">Categoria</Label>
        <Input
          id="categoria"
          name="categoria"
          required
          list="categorias-sugeridas"
          defaultValue={defaultValues?.categoria}
        />
        <datalist id="categorias-sugeridas">
          {CATEGORIAS_SUGERIDAS.map((categoria) => (
            <option key={categoria} value={categoria} />
          ))}
        </datalist>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">
          Frequência
        </legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="frequencia"
              value="diaria"
              className="accent-[var(--primary)]"
              defaultChecked={
                !defaultValues || defaultValues.frequencia === "diaria"
              }
              onChange={() => setFrequencia("diaria")}
            />
            Diária
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="frequencia"
              value="dias_especificos"
              className="accent-[var(--primary)]"
              defaultChecked={defaultValues?.frequencia === "dias_especificos"}
              onChange={() => setFrequencia("dias_especificos")}
            />
            Dias específicos da semana
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="frequencia"
              value="unica"
              className="accent-[var(--primary)]"
              defaultChecked={defaultValues?.frequencia === "unica"}
              onChange={() => setFrequencia("unica")}
            />
            Pontual (meta única)
          </label>
        </div>
      </fieldset>

      {frequencia === "dias_especificos" && (
        <div className="flex flex-wrap gap-2">
          {DIAS.map((dia) => (
            <label
              key={dia.value}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground"
            >
              <input
                type="checkbox"
                name="dias_semana"
                value={dia.value}
                className="accent-[var(--primary)]"
                defaultChecked={diasSelecionados.has(dia.value)}
              />
              {dia.label}
            </label>
          ))}
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Peso</legend>
        <div className="flex gap-4">
          {PESOS.map((peso) => (
            <label
              key={peso.value}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="radio"
                name="peso"
                value={peso.value}
                className="accent-[var(--primary)]"
                defaultChecked={
                  defaultValues?.peso === peso.value ||
                  (!defaultValues && peso.value === "leve")
                }
              />
              {peso.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
