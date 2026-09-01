import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";
import type { Activity } from "./day-consistency";

// Terça-feira, 2026-09-01 ("hoje" fixo em todos os testes desta suíte).
const HOJE = new Date(2026, 8, 1);
const CONTA_CRIADA = new Date(2026, 7, 1); // bem antes, não é o limite testado

function diaria(id = "a1", criadoEm = CONTA_CRIADA): Activity {
  return {
    id,
    frequencia: "diaria",
    dias_semana: null,
    criado_em: criadoEm.toISOString(),
  };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

describe("computeStreak", () => {
  it("sem atividades, streak é zero e o freeze semanal está cheio", () => {
    const resultado = computeStreak({
      activities: [],
      logDaysByActivity: new Map(),
      accountCreatedDay: CONTA_CRIADA,
      hoje: HOJE,
    });
    expect(resultado).toEqual({ streakAtual: 0, freezesDisponiveis: 1 });
  });

  it("acumula um dia por conclusão consecutiva, incluindo hoje", () => {
    // Atividade criada no mesmo dia do log mais antigo, para que não haja
    // dias "falhos" anteriores elegíveis a freeze distorcendo a contagem.
    const logs = [0, -1, -2, -3].map((offset) => addDays(HOJE, offset));
    const resultado = computeStreak({
      activities: [diaria("a1", addDays(HOJE, -3))],
      logDaysByActivity: new Map([["a1", logs]]),
      accountCreatedDay: CONTA_CRIADA,
      hoje: HOJE,
    });
    expect(resultado.streakAtual).toBe(4);
  });

  it("hoje incompleto não quebra o streak, mas também não conta ainda", () => {
    // Só ontem e anteontem concluídos; hoje sem log nenhum. Atividade criada
    // no dia do log mais antigo, mesmo motivo do teste acima.
    const logs = [-1, -2].map((offset) => addDays(HOJE, offset));
    const resultado = computeStreak({
      activities: [diaria("a1", addDays(HOJE, -2))],
      logDaysByActivity: new Map([["a1", logs]]),
      accountCreatedDay: CONTA_CRIADA,
      hoje: HOJE,
    });
    expect(resultado.streakAtual).toBe(2);
  });

  it("freeze absorve automaticamente 1 dia perdido por semana", () => {
    // HOJE é terça (2026-09-01). Semana atual: seg 08-31 a dom 09-06.
    // Logs: hoje e segunda (08-31) concluídos; domingo (08-30, semana
    // passada) sem log deveria ser perdoado pelo freeze daquela semana.
    const logs = [addDays(HOJE, 0), addDays(HOJE, -1)]; // hoje e segunda
    const resultado = computeStreak({
      activities: [diaria("a1", new Date(2026, 7, 1))],
      logDaysByActivity: new Map([["a1", logs]]),
      accountCreatedDay: new Date(2026, 7, 1),
      hoje: HOJE,
    });
    // hoje (met) + segunda (met) + domingo 08-30 (falho, freeze da semana
    // passada absorve) = 3; sábado 08-29 (mesma semana passada) já sem
    // freeze disponível -> quebra ali.
    expect(resultado.streakAtual).toBe(3);
  });

  it("2 dias perdidos na mesma semana: só o primeiro é perdoado", () => {
    const segunda = addDays(HOJE, -1); // 08-31, início da semana atual
    // Só "hoje" tem log; segunda (mesma semana) fica sem log -> freeze da
    // semana atual; o dia seguinte a quebrar (domingo, semana passada) tem
    // seu próprio freeze, mas o dia depois desse já não tem mais nenhum.
    const activities = [diaria("a1", addDays(segunda, -7))]; // existe há mais de 1 semana
    const logs = new Map([["a1", [HOJE]]]);

    const resultado = computeStreak({
      activities,
      logDaysByActivity: logs,
      accountCreatedDay: addDays(segunda, -14),
      hoje: HOJE,
    });

    // hoje (met, +1) + segunda (falho, freeze semana atual, +1) +
    // domingo 08-30 (falho, freeze semana passada, +1) = 3; sábado 08-29
    // (mesma semana passada, freeze já usado) quebra ali.
    expect(resultado.streakAtual).toBe(3);
  });

  it("streak para exatamente na fronteira de accountCreatedDay", () => {
    const contaCriadaHoje = HOJE;
    const resultado = computeStreak({
      activities: [diaria("a1", HOJE)],
      logDaysByActivity: new Map([["a1", [HOJE]]]),
      accountCreatedDay: contaCriadaHoje,
      hoje: HOJE,
    });
    expect(resultado.streakAtual).toBe(1);
  });

  it("dia sem nenhuma atividade aplicável é neutro (não soma, não quebra)", () => {
    // Atividade só existe a partir de hoje; dias antes disso são neutros,
    // então o loop não deveria quebrar nada, só parar ao alcançar o limite.
    const resultado = computeStreak({
      activities: [diaria("a1", HOJE)],
      logDaysByActivity: new Map([["a1", [HOJE]]]),
      accountCreatedDay: addDays(HOJE, -30),
      hoje: HOJE,
    });
    expect(resultado.streakAtual).toBe(1);
  });
});
