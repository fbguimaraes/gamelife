import { describe, expect, it } from "vitest";
import { calcularNivel, pontosParaProximoNivel } from "./nivel";

describe("calcularNivel", () => {
  it("começa no nível 1 com 0 pontos", () => {
    expect(calcularNivel(0)).toBe(1);
  });

  it("permanece no nível 1 até completar 100 pontos", () => {
    expect(calcularNivel(99)).toBe(1);
  });

  it("sobe para o nível 2 exatamente aos 100 pontos", () => {
    expect(calcularNivel(100)).toBe(2);
  });

  it("sobe para o nível 3 aos 200 pontos", () => {
    expect(calcularNivel(200)).toBe(3);
  });

  it("calcula níveis altos corretamente", () => {
    expect(calcularNivel(1050)).toBe(11);
  });
});

describe("pontosParaProximoNivel", () => {
  it("calcula quantos pontos faltam para o próximo nível", () => {
    expect(pontosParaProximoNivel(20).faltam).toBe(80);
    expect(pontosParaProximoNivel(150).faltam).toBe(50);
  });

  it("faltam 100 pontos logo após subir de nível", () => {
    expect(pontosParaProximoNivel(100).faltam).toBe(100);
  });
});
