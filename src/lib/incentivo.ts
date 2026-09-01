// Banco de mensagens de incentivo (item 2.8), exibidas contextualmente ao
// concluir uma atividade — CLAUDE.md Seção 3 ("Mensagens de incentivo
// variadas") e especificacao-app-metas-diarias.md Seção 3.3. Categorias
// definidas a partir do texto do próprio to-do: streak, retomada, marco.

// Streaks em que vale destacar como marco — progressão de habito comum
// (3 dias, 1 semana, 2 semanas, 1 mês...).
const MARCOS_STREAK = [3, 7, 14, 30, 60, 100, 200, 365];

const MENSAGENS_MARCO = [
  (streak: number) => `${streak} dias seguidos. Isso já é consistência de verdade.`,
  (streak: number) => `Marco alcançado: ${streak} dias sem parar.`,
  (streak: number) => `${streak} dias na sequência — o hábito está pegando forma.`,
];

const MENSAGENS_RETOMADA = [
  "De volta ao ritmo. O que importa é continuar.",
  "Streak reiniciado — o que ficou para trás não define o que vem agora.",
  "Retomou hoje. Isso já vale mais do que parecer.",
];

const MENSAGENS_STREAK = [
  (streak: number) => `${streak} dias seguidos. Continue assim.`,
  (streak: number) => `Sequência de ${streak} dias mantida.`,
  (streak: number) => `Mais um dia na conta: ${streak} seguidos.`,
];

const MENSAGENS_PADRAO = [
  "Atividade concluída.",
  "Mais uma concluída.",
  "Feito. Um passo de cada vez.",
];

function escolher<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Escolhe a mensagem de incentivo exibida no toast ao concluir uma
 * atividade, a partir do streak antes e depois da conclusão.
 *
 * Prioridade: marco > retomada > streak > padrão. Um marco só é possível a
 * partir de streakAtual >= 3 (ver MARCOS_STREAK), e retomada só ocorre
 * quando o streak zera e volta a 1 — não há colisão entre as duas regras.
 */
export function mensagemDeConclusao({
  streakAnterior,
  streakAtual,
  houveHistoricoAnterior,
}: {
  streakAnterior: number;
  streakAtual: number;
  houveHistoricoAnterior: boolean;
}): string {
  if (MARCOS_STREAK.includes(streakAtual)) {
    return escolher(MENSAGENS_MARCO)(streakAtual);
  }

  const retomada =
    streakAnterior === 0 && streakAtual === 1 && houveHistoricoAnterior;
  if (retomada) {
    return escolher(MENSAGENS_RETOMADA);
  }

  if (streakAtual > 1) {
    return escolher(MENSAGENS_STREAK)(streakAtual);
  }

  return escolher(MENSAGENS_PADRAO);
}

/**
 * Mensagem exibida quando uma conquista é desbloqueada (item 3.2) — tem
 * prioridade sobre as mensagens de mensagemDeConclusao() no toast, já que
 * desbloquear uma conquista é um marco mais específico que qualquer
 * variação de streak.
 */
export function mensagemDeConquista(tituloConquista: string): string {
  return `Conquista desbloqueada: ${tituloConquista}.`;
}
