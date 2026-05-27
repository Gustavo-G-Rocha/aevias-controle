import { describe, it, expect } from "vitest";
import {
  formatDate,
  fmtNum,
  temSegundaClassificacao,
  getDensidades,
  calcUmidadeNatural2,
  calcMediaUmidade,
  chunkArray,
  getDensidadeRows,
} from "@/utils/relatorioBoletimSondagemUtils";

describe("relatorioBoletimSondagemUtils", () => {
  describe("formatDate", () => {
    it("deve formatar data para pt-BR", () => {
      const result = formatDate("2026-05-27");
      expect(result).toMatch(/27\/0?5\/2026/);
    });

    it("deve retornar '-' para null", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
    });
  });

  describe("fmtNum", () => {
    it("deve formatar com 2 casas decimais por padrão", () => {
      expect(fmtNum(10.456)).toBe("10.46");
      expect(fmtNum(10)).toBe("10.00");
    });

    it("deve formatar com casas decimais customizadas", () => {
      expect(fmtNum(1.234567, 3)).toBe("1.235");
    });

    it("deve retornar '-' para null e undefined", () => {
      expect(fmtNum(null)).toBe("-");
      expect(fmtNum(undefined)).toBe("-");
    });
  });

  describe("temSegundaClassificacao", () => {
    it("deve retornar true se alguma camada tiver classificacao_2", () => {
      const camadas = [
        { classificacao_1: "Argila", classificacao_2: "Solo 2" },
      ];
      expect(temSegundaClassificacao(camadas)).toBe(true);
    });

    it("deve retornar false se nenhuma camada tiver classificacao_2", () => {
      const camadas = [
        { classificacao_1: "Argila", classificacao_2: null },
        { classificacao_1: "Areia" },
      ];
      expect(temSegundaClassificacao(camadas)).toBe(false);
    });

    it("deve retornar false para array vazio ou null", () => {
      expect(temSegundaClassificacao([])).toBe(false);
      expect(temSegundaClassificacao(null)).toBe(false);
    });
  });

  describe("getDensidades", () => {
    it("deve retornar densidades_in_situ quando existirem", () => {
      const boletim = { densidades_in_situ: [{ id: 1 }, { id: 2 }] };
      const result = getDensidades(boletim);
      expect(result).toHaveLength(2);
    });

    it("deve usar densidade_in_situ (campo antigo) como fallback", () => {
      const boletim = { densidade_in_situ: { id: 1 } };
      const result = getDensidades(boletim);
      expect(result).toHaveLength(1);
    });

    it("deve retornar array com objeto vazio se não houver dados", () => {
      const boletim = {};
      const result = getDensidades(boletim);
      expect(result).toEqual([{}]);
    });
  });

  describe("calcUmidadeNatural2", () => {
    it("deve calcular umidade corretamente", () => {
      const un2 = {
        massa_cap_solo_umido_1: 100,
        massa_cap_solo_seco_1: 90,
        massa_capsula_1: 10,
      };
      // ss = 90 - 10 = 80; umidade = ((100-90)/80)*100 = 12.5
      const result = calcUmidadeNatural2(un2, 1);
      expect(result).toBe(12.5);
    });

    it("deve retornar null se ss <= 0", () => {
      const un2 = {
        massa_cap_solo_umido_1: 100,
        massa_cap_solo_seco_1: 10,
        massa_capsula_1: 10, // ss = 0
      };
      expect(calcUmidadeNatural2(un2, 1)).toBeNull();
    });

    it("deve retornar null se valores ausentes", () => {
      expect(calcUmidadeNatural2({}, 1)).toBeNull();
    });
  });

  describe("calcMediaUmidade", () => {
    it("deve calcular média de duas umidades", () => {
      expect(calcMediaUmidade(10, 20)).toBe("15.00%");
    });

    it("deve retornar valor único se apenas u1", () => {
      expect(calcMediaUmidade(12.5, null)).toBe("12.50%");
    });

    it("deve retornar '-' se não houver dados", () => {
      expect(calcMediaUmidade(null, null)).toBe("-");
    });
  });

  describe("chunkArray", () => {
    it("deve dividir array em chunks de tamanho fixo", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const result = chunkArray(arr, 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1, 2, 3]);
      expect(result[1]).toEqual([4, 5, 6]);
      expect(result[2]).toEqual([7]);
    });

    it("deve retornar array vazio para input vazio", () => {
      expect(chunkArray([], 3)).toEqual([]);
    });

    it("deve retornar um único chunk se menor que size", () => {
      const result = chunkArray([1, 2], 6);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual([1, 2]);
    });
  });

  describe("getDensidadeRows", () => {
    it("deve retornar array de linhas da tabela de densidade", () => {
      const rows = getDensidadeRows();
      expect(rows.length).toBeGreaterThan(0);
    });

    it("deve incluir linhas de seção", () => {
      const rows = getDensidadeRows();
      const sections = rows.filter((r) => r.section);
      expect(sections.map((s) => s.label)).toEqual([
        "VOLUME",
        "MASSA",
        "UMIDADE",
        "RESULTADOS",
      ]);
    });

    it("deve incluir linhas de resultado com dec=3", () => {
      const rows = getDensidadeRows();
      const results = rows.filter((r) => r.result);
      expect(results).toHaveLength(2);
      results.forEach((r) => expect(r.dec).toBe(3));
    });
  });
});