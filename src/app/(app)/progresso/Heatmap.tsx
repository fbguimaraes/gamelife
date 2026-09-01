import type { DiaHeatmap, NivelDia } from "@/lib/heatmap";

// Escala de intensidade do heatmap (item 3.4) — tons derivados de --accent
// (e um tom leve de --danger para dias com atividade aplicável e nenhuma
// conclusão), mesmo mecanismo de color-mix já usado para o hover sutil do
// shadcn em globals.css. Registrado em CLAUDE.md Seção 4 junto com este
// item, resolvendo o placeholder de --chart-* deixado em aberto no item 1.2.
const COR_POR_NIVEL: Record<NivelDia, string> = {
  "sem-dados": "bg-surface border border-border",
  falho: "bg-[color-mix(in_oklab,var(--danger)_15%,var(--surface))]",
  1: "bg-[color-mix(in_oklab,var(--accent)_20%,var(--surface))]",
  2: "bg-[color-mix(in_oklab,var(--accent)_45%,var(--surface))]",
  3: "bg-[color-mix(in_oklab,var(--accent)_70%,var(--surface))]",
  4: "bg-primary",
};

const ROTULO_POR_NIVEL: Record<NivelDia, string> = {
  "sem-dados": "sem atividades aplicáveis",
  falho: "nenhuma conclusão",
  1: "menos de 50% concluído",
  2: "50–74% concluído",
  3: "75–99% concluído",
  4: "100% concluído",
};

export function Heatmap({ semanas }: { semanas: DiaHeatmap[][] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {semanas.map((dias, i) => (
          <div key={i} className="flex flex-col gap-1">
            {dias.map((dia, j) => (
              <div
                key={j}
                title={`${new Intl.DateTimeFormat("pt-BR", {
                  day: "numeric",
                  month: "long",
                }).format(dia.data)}: ${ROTULO_POR_NIVEL[dia.nivel]}`}
                className={`h-3 w-3 rounded-[2px] ${COR_POR_NIVEL[dia.nivel]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Menos</span>
        {(["sem-dados", "falho", 1, 2, 3, 4] as NivelDia[]).map((nivel) => (
          <div
            key={nivel}
            className={`h-3 w-3 rounded-[2px] ${COR_POR_NIVEL[nivel]}`}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}
