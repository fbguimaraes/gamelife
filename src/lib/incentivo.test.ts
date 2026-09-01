import { describe, expect, it } from "vitest";
import { mensagemDeConclusao, mensagemDeConquista } from "./incentivo";

describe("mensagemDeConclusao", () => {
  it("prioriza marco quando o streak atinge um número de marco", () => {
    const msg = mensagemDeConclusao({
      streakAnterior: 6,
      streakAtual: 7,
      houveHistoricoAnterior: true,
    });
    expect(msg).toContain("7");
  });

  it("reconhece retomada: streak zerado, histórico existente, volta a 1", () => {
    const msg = mensagemDeConclusao({
      streakAnterior: 0,
      streakAtual: 1,
      houveHistoricoAnterior: true,
    });
    const mensagensDeRetomada = [
      "De volta ao ritmo. O que importa é continuar.",
      "Streak reiniciado — o que ficou para trás não define o que vem agora.",
      "Retomou hoje. Isso já vale mais do que parecer.",
    ];
    expect(mensagensDeRetomada).toContain(msg);
  });

  it("primeira conclusão da conta (sem histórico) não é tratada como retomada", () => {
    const msg = mensagemDeConclusao({
      streakAnterior: 0,
      streakAtual: 1,
      houveHistoricoAnterior: false,
    });
    // Deve cair no banco padrão, não no de retomada.
    expect(msg).not.toMatch(/retomou|de volta|reiniciado/i);
  });

  it("streak > 1 fora de um marco usa a mensagem de streak (menciona o número)", () => {
    const msg = mensagemDeConclusao({
      streakAnterior: 3,
      streakAtual: 4,
      houveHistoricoAnterior: true,
    });
    expect(msg).toContain("4");
  });

  it("streak de 1 sem retomada usa mensagem padrão, sem número", () => {
    const msg = mensagemDeConclusao({
      streakAnterior: 0,
      streakAtual: 1,
      houveHistoricoAnterior: false,
    });
    expect(msg).not.toMatch(/\d/);
  });
});

describe("mensagemDeConquista", () => {
  it("inclui o título da conquista na mensagem", () => {
    expect(mensagemDeConquista("Uma Semana Firme")).toBe(
      "Conquista desbloqueada: Uma Semana Firme."
    );
  });
});
