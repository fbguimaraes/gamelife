import { describe, expect, it } from "vitest";
import { evaluateDay, type Activity } from "./day-consistency";

// Terça-feira, 2026-09-01 — mesma data usada nas outras suítes deste projeto.
const TERCA = new Date(2026, 8, 1);
const QUARTA = new Date(2026, 8, 2);
const SEGUNDA = new Date(2026, 8, 31); // véspera, para testar "antes de existir"

function atividade(overrides: Partial<Activity>): Activity {
  return {
    id: "a1",
    frequencia: "diaria",
    dias_semana: null,
    criado_em: new Date(2026, 7, 1).toISOString(),
    ...overrides,
  };
}

describe("evaluateDay", () => {
  it("atividade diária é sempre aplicável", () => {
    const { applicable, completed } = evaluateDay(TERCA, [atividade({})], new Map());
    expect(applicable).toBe(1);
    expect(completed).toBe(0);
  });

  it("marca como concluída quando há log no mesmo dia", () => {
    const act = atividade({ id: "a1" });
    const logs = new Map([["a1", [TERCA]]]);
    const { applicable, completed } = evaluateDay(TERCA, [act], logs);
    expect(applicable).toBe(1);
    expect(completed).toBe(1);
  });

  it("dias_especificos só é aplicável nos dias configurados (1=seg...7=dom)", () => {
    const act = atividade({ frequencia: "dias_especificos", dias_semana: [3] }); // quarta
    expect(evaluateDay(TERCA, [act], new Map()).applicable).toBe(0);
    expect(evaluateDay(QUARTA, [act], new Map()).applicable).toBe(1);
  });

  it("atividade não é aplicável antes de ser criada", () => {
    const act = atividade({ criado_em: QUARTA.toISOString() });
    expect(evaluateDay(TERCA, [act], new Map()).applicable).toBe(0);
    expect(evaluateDay(QUARTA, [act], new Map()).applicable).toBe(1);
  });

  it("'unica' fica aplicável até o dia da sua conclusão e some depois", () => {
    const act = atividade({ id: "u1", frequencia: "unica" });

    // Sem log nenhum: aplicável e pendente em qualquer dia (após criada).
    expect(evaluateDay(TERCA, [act], new Map())).toEqual({
      applicable: 1,
      completed: 0,
    });

    // Concluída na terça: aplicável e concluída nesse dia exato.
    const logsNaTerca = new Map([["u1", [TERCA]]]);
    expect(evaluateDay(TERCA, [act], logsNaTerca)).toEqual({
      applicable: 1,
      completed: 1,
    });

    // No dia seguinte, some por completo (nem pendente, nem concluída).
    expect(evaluateDay(QUARTA, [act], logsNaTerca)).toEqual({
      applicable: 0,
      completed: 0,
    });
  });

  it("soma múltiplas atividades no mesmo dia", () => {
    const diaria = atividade({ id: "d1" });
    const especifica = atividade({
      id: "d2",
      frequencia: "dias_especificos",
      dias_semana: [2], // terça
    });
    const logs = new Map([["d1", [TERCA]]]);
    const { applicable, completed } = evaluateDay(
      TERCA,
      [diaria, especifica],
      logs
    );
    expect(applicable).toBe(2);
    expect(completed).toBe(1);
  });

  it("dia sem nenhuma atividade aplicável retorna zero/zero", () => {
    const act = atividade({ criado_em: SEGUNDA.toISOString() });
    // um dia bem antes de a atividade existir
    const antesDeExistir = new Date(2026, 0, 1);
    expect(evaluateDay(antesDeExistir, [act], new Map())).toEqual({
      applicable: 0,
      completed: 0,
    });
  });
});
