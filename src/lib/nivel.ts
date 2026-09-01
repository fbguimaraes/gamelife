// Nível geral do usuário (item 3.5), a partir dos pontos acumulados.
// Regra definida agora (não estava em nenhum documento-fonte, apenas "nível
// geral simples" — CLAUDE.md Seção 3): a cada 100 pontos acumulados, o
// usuário sobe 1 nível. Nível mínimo é 1 (usuário com 0 pontos já está no
// nível 1, não no nível 0).
const PONTOS_POR_NIVEL = 100;

export function calcularNivel(pontosTotais: number): number {
  return Math.floor(pontosTotais / PONTOS_POR_NIVEL) + 1;
}

// Quantos pontos faltam para o próximo nível — usado no dashboard (item 3.6)
// para mostrar progresso, não apenas o número do nível.
export function pontosParaProximoNivel(pontosTotais: number): {
  faltam: number;
  nivelAtualMin: number;
  proximoNivelMin: number;
} {
  const nivelAtualMin = (calcularNivel(pontosTotais) - 1) * PONTOS_POR_NIVEL;
  const proximoNivelMin = nivelAtualMin + PONTOS_POR_NIVEL;
  return {
    faltam: proximoNivelMin - pontosTotais,
    nivelAtualMin,
    proximoNivelMin,
  };
}
