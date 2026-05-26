/**
 * Testes das funções puras do Ensaio de Sondagem.
 */
import { describe, it, expect } from 'vitest';
import {
  getCorpoProvaInicial,
  getInitialFormData,
  calcularMediaEspessura,
  calcularVolume,
  calcularDensidade,
  calcularGCProjeto,
  calcularGCRice,
  calcularVolumeVazios,
  calcularRTCD,
  recalcularCP,
  validarCPsParaFinalizar,
  serializarFormData,
  validarArquivoFoto,
  filtrarObrasPorAcesso,
  filtrarProjetosPorObra,
} from '@/utils/ensaioSondagemUtils';

// ─── getCorpoProvaInicial ─────────────────────────────────────────────────────
describe('getCorpoProvaInicial', () => {
  it('numero está correto', () => {
    expect(getCorpoProvaInicial(3).numero).toBe(3);
  });
  it('medidas_espessura é array de 4 strings vazias', () => {
    expect(getCorpoProvaInicial(1).medidas_espessura).toEqual(["", "", "", ""]);
  });
  it('lado padrão é "direito"', () => {
    expect(getCorpoProvaInicial(1).lado).toBe("direito");
  });
  it('campos calculados são strings vazias', () => {
    const cp = getCorpoProvaInicial(1);
    expect(cp.volume).toBe("");
    expect(cp.densidade).toBe("");
    expect(cp.rtcd_25c).toBe("");
  });
});

// ─── getInitialFormData ───────────────────────────────────────────────────────
describe('getInitialFormData', () => {
  it('metodo_ensaio padrão é DNIT 428/2022', () => {
    expect(getInitialFormData().metodo_ensaio).toBe("DNIT 428/2022");
  });
  it('corpos_prova começa vazio', () => {
    expect(getInitialFormData().corpos_prova).toEqual([]);
  });
  it('status padrão é rascunho', () => {
    expect(getInitialFormData().status).toBe("rascunho");
  });
  it('dens_agua_25c padrão é 0.9971', () => {
    expect(getInitialFormData().dens_agua_25c).toBe(0.9971);
  });
});

// ─── calcularMediaEspessura ───────────────────────────────────────────────────
describe('calcularMediaEspessura', () => {
  it('retorna média com 2 casas quando 4 medidas válidas', () => {
    expect(calcularMediaEspessura(["4.0", "4.0", "4.0", "4.0"])).toBe("4.00");
  });
  it('retorna string vazia quando menos de 4 medidas', () => {
    expect(calcularMediaEspessura(["4.0", "4.0", ""])).toBe("");
  });
  it('ignora strings vazias no count', () => {
    expect(calcularMediaEspessura(["4.0", "4.0", "4.0", ""])).toBe("");
  });
  it('calcula corretamente com valores distintos', () => {
    expect(calcularMediaEspessura(["3.0", "4.0", "5.0", "4.0"])).toBe("4.00");
  });
  it('retorna string vazia para array vazio', () => {
    expect(calcularMediaEspessura([])).toBe("");
  });
});

// ─── calcularVolume ───────────────────────────────────────────────────────────
describe('calcularVolume', () => {
  it('DNIT: volume = saturado - imerso', () => {
    const cp = { peso_saturado: "500", peso_imerso: "300", peso_ao_ar: "490", volume: "" };
    expect(calcularVolume(cp, "DNIT 428/2022")).toBe("200.00");
  });
  it('DNER: volume = ar - imerso', () => {
    const cp = { peso_ao_ar: "490", peso_imerso: "300", peso_saturado: "", volume: "" };
    expect(calcularVolume(cp, "DNER 117/94")).toBe("190.00");
  });
  it('retorna valor anterior quando campos insuficientes', () => {
    const cp = { peso_saturado: "", peso_imerso: "", peso_ao_ar: "", volume: "100.00" };
    expect(calcularVolume(cp, "DNIT 428/2022")).toBe("100.00");
  });
});

// ─── calcularDensidade ────────────────────────────────────────────────────────
describe('calcularDensidade', () => {
  it('DNIT: densidade = (ar / vol) × dens_agua', () => {
    const cp = { peso_ao_ar: "500", volume: "200" };
    const resultado = parseFloat(calcularDensidade(cp, "DNIT 428/2022", 0.9971));
    expect(resultado).toBeCloseTo((500 / 200) * 0.9971, 3);
  });
  it('DNER: densidade = ar / vol (sem dens_agua)', () => {
    const cp = { peso_ao_ar: "500", volume: "200" };
    expect(calcularDensidade(cp, "DNER 117/94", 0.9971)).toBe("2.500");
  });
  it('retorna valor anterior quando volume = 0', () => {
    const cp = { peso_ao_ar: "500", volume: "0", densidade: "2.400" };
    expect(calcularDensidade(cp, "DNIT 428/2022", 0.9971)).toBe("2.400");
  });
});

// ─── calcularGCProjeto ────────────────────────────────────────────────────────
describe('calcularGCProjeto', () => {
  it('calcula GC = (d / dp) × 100', () => {
    expect(calcularGCProjeto("2.450", "2.450")).toBe("100.0");
  });
  it('retorna string vazia quando dens_projeto = 0', () => {
    expect(calcularGCProjeto("2.450", "0")).toBe("");
  });
  it('retorna string vazia quando densidade = 0', () => {
    expect(calcularGCProjeto("0", "2.450")).toBe("");
  });
  it('arredonda para 1 casa decimal', () => {
    expect(calcularGCProjeto("2.400", "2.450")).toBe("98.0");
  });
});

// ─── calcularGCRice ───────────────────────────────────────────────────────────
describe('calcularGCRice', () => {
  it('calcula GC_rice = (d / rice) × 100', () => {
    expect(calcularGCRice("2.450", "2.500")).toBe("98.0");
  });
  it('retorna string vazia quando rice = 0', () => {
    expect(calcularGCRice("2.450", "0")).toBe("");
  });
  it('retorna string vazia quando densidade = ""', () => {
    expect(calcularGCRice("", "2.500")).toBe("");
  });
});

// ─── calcularVolumeVazios ─────────────────────────────────────────────────────
describe('calcularVolumeVazios', () => {
  it('volume_vazios = 100 - gc_rice', () => {
    expect(calcularVolumeVazios("98.0")).toBe("2.0");
  });
  it('retorna string vazia quando gc = 0', () => {
    expect(calcularVolumeVazios("0")).toBe("");
  });
  it('retorna string vazia para string vazia', () => {
    expect(calcularVolumeVazios("")).toBe("");
  });
});

// ─── calcularRTCD ─────────────────────────────────────────────────────────────
describe('calcularRTCD', () => {
  it('retorna string vazia quando leitura = 0', () => {
    expect(calcularRTCD("0", "4.0", 1)).toBe("");
  });
  it('retorna string vazia quando espessura = 0', () => {
    expect(calcularRTCD("100", "0", 1)).toBe("");
  });
  it('calcula RTCD com fórmula correta', () => {
    const leitura = 100, fator = 1, espCm = 5;
    const F_N = leitura * fator * 9.80665;
    const esperado = ((2 * F_N) / (Math.PI * 100 * 50)).toFixed(2);
    expect(calcularRTCD("100", "5", 1)).toBe(esperado);
  });
  it('aplica fator de correção da prensa', () => {
    const r1 = parseFloat(calcularRTCD("100", "5", 1));
    const r2 = parseFloat(calcularRTCD("100", "5", 2));
    expect(r2).toBeCloseTo(r1 * 2, 2);
  });
});

// ─── recalcularCP ─────────────────────────────────────────────────────────────
describe('recalcularCP', () => {
  const base = {
    medidas_espessura: ["", "", "", ""],
    peso_ao_ar: "", peso_imerso: "", peso_saturado: "",
    volume: "", densidade: "",
    gc_dens_projeto: "", dens_rice_do_dia: "", gc_dens_rice_dia: "",
    volume_vazios: "", leitura: "", rtcd_25c: "", media_espessura: "",
  };

  it('não muta o objeto original', () => {
    const original = JSON.stringify(base);
    recalcularCP(base, 'leitura', '100', "DNIT 428/2022", 0.9971, "2.450", 1);
    expect(JSON.stringify(base)).toBe(original);
  });

  it('atualiza media_espessura quando medidas preenchidas', () => {
    const cp = { ...base };
    const resultado = recalcularCP(cp, 'medidas_espessura', ["4.0", "4.0", "4.0", "4.0"], "DNIT 428/2022", 0.9971, "", 1);
    expect(resultado.media_espessura).toBe("4.00");
  });

  it('calcula volume DNIT ao mudar peso_saturado', () => {
    const cp = { ...base, peso_imerso: "300" };
    const resultado = recalcularCP(cp, 'peso_saturado', '500', "DNIT 428/2022", 0.9971, "", 1);
    expect(resultado.volume).toBe("200.00");
  });

  it('propaga cálculo em cascata: volume → densidade → gc_projeto', () => {
    const cp = { ...base, peso_ao_ar: "490", peso_imerso: "290" };
    const resultado = recalcularCP(cp, 'peso_saturado', '490', "DNIT 428/2022", 0.9971, "2.450", 1);
    expect(parseFloat(resultado.volume)).toBeGreaterThan(0);
    expect(parseFloat(resultado.densidade)).toBeGreaterThan(0);
  });
});

// ─── validarCPsParaFinalizar ──────────────────────────────────────────────────
describe('validarCPsParaFinalizar', () => {
  it('retorna array vazio quando todos CPs completos', () => {
    const cps = [{
      numero: 1,
      medidas_espessura: ["4.0", "4.0", "4.0", "4.0"],
      peso_ao_ar: "500", peso_imerso: "300", peso_saturado: "500",
    }];
    expect(validarCPsParaFinalizar(cps, "DNIT 428/2022")).toEqual([]);
  });

  it('retorna número do CP com medidas incompletas', () => {
    const cps = [{
      numero: 2,
      medidas_espessura: ["4.0", "4.0", "", ""],
      peso_ao_ar: "500", peso_imerso: "300", peso_saturado: "500",
    }];
    expect(validarCPsParaFinalizar(cps, "DNIT 428/2022")).toContain(2);
  });

  it('retorna número do CP sem peso saturado no método DNIT', () => {
    const cps = [{
      numero: 3,
      medidas_espessura: ["4.0", "4.0", "4.0", "4.0"],
      peso_ao_ar: "500", peso_imerso: "300", peso_saturado: "",
    }];
    expect(validarCPsParaFinalizar(cps, "DNIT 428/2022")).toContain(3);
  });

  it('não exige peso saturado no método DNER', () => {
    const cps = [{
      numero: 4,
      medidas_espessura: ["4.0", "4.0", "4.0", "4.0"],
      peso_ao_ar: "500", peso_imerso: "300", peso_saturado: "",
    }];
    expect(validarCPsParaFinalizar(cps, "DNER 117/94")).toEqual([]);
  });

  it('ignora CPs sem nenhum dado preenchido', () => {
    const cps = [{
      numero: 5,
      medidas_espessura: ["", "", "", ""],
      peso_ao_ar: "", peso_imerso: "", peso_saturado: "",
    }];
    expect(validarCPsParaFinalizar(cps, "DNIT 428/2022")).toEqual([]);
  });
});

// ─── serializarFormData ───────────────────────────────────────────────────────
describe('serializarFormData', () => {
  const base = {
    fator_correcao_prensa: "1.5",
    dens_agua_25c: "0.9971",
    volume_vazios_projeto: "4.5",
    dens_aparente_projeto: "2.450",
    dens_rice_projeto: "2.560",
    espessura_projeto: "7.0",
    corpos_prova: [],
  };

  it('define o status passado como parâmetro', () => {
    expect(serializarFormData(base, "finalizado").status).toBe("finalizado");
    expect(serializarFormData(base, "rascunho").status).toBe("rascunho");
  });

  it('converte fator_correcao_prensa para number', () => {
    expect(typeof serializarFormData(base, "rascunho").fator_correcao_prensa).toBe("number");
  });

  it('converte volume_vazios_projeto para number', () => {
    expect(serializarFormData(base, "rascunho").volume_vazios_projeto).toBe(4.5);
  });

  it('define null quando espessura_projeto está vazio', () => {
    expect(serializarFormData({ ...base, espessura_projeto: "" }, "rascunho").espessura_projeto).toBeNull();
  });

  it('serializa campos numéricos dos corpos de prova', () => {
    const fd = {
      ...base,
      corpos_prova: [{
        numero: "1",
        medidas_espessura: ["4.0", "4.0", "", ""],
        media_espessura: "4.0",
        peso_ao_ar: "500", peso_imerso: "300", peso_saturado: "500",
        volume: "200", densidade: "2.450",
        gc_dens_projeto: "100", dens_rice_do_dia: "2.500",
        gc_dens_rice_dia: "98", volume_vazios: "2",
        leitura: "100", rtcd_25c: "1.25",
      }],
    };
    const resultado = serializarFormData(fd, "finalizado");
    expect(resultado.corpos_prova[0].numero).toBe(1);
    expect(resultado.corpos_prova[0].peso_ao_ar).toBe(500);
    expect(resultado.corpos_prova[0].rtcd_25c).toBe(1.25);
  });

  it('filtra medidas_espessura nulas ou vazias', () => {
    const fd = {
      ...base,
      corpos_prova: [{
        numero: "1", medidas_espessura: ["4.0", "", null, "4.0"],
        media_espessura: "", peso_ao_ar: "", peso_imerso: "",
        peso_saturado: "", volume: "", densidade: "", gc_dens_projeto: "",
        dens_rice_do_dia: "", gc_dens_rice_dia: "", volume_vazios: "",
        leitura: "", rtcd_25c: "",
      }],
    };
    const resultado = serializarFormData(fd, "rascunho");
    expect(resultado.corpos_prova[0].medidas_espessura).toEqual([4.0, 4.0]);
  });
});

// ─── validarArquivoFoto ───────────────────────────────────────────────────────
describe('validarArquivoFoto', () => {
  it('aceita image/jpeg', () => {
    expect(validarArquivoFoto({ type: 'image/jpeg', size: 1000 })).toBe(true);
  });
  it('aceita image/png', () => {
    expect(validarArquivoFoto({ type: 'image/png', size: 1000 })).toBe(true);
  });
  it('lança erro para tipo não suportado', () => {
    expect(() => validarArquivoFoto({ type: 'application/pdf', size: 1000 })).toThrow();
  });
  it('lança erro para arquivo maior que 10MB', () => {
    expect(() => validarArquivoFoto({ type: 'image/jpeg', size: 11 * 1024 * 1024 })).toThrow();
  });
});

// ─── filtrarObrasPorAcesso ────────────────────────────────────────────────────
describe('filtrarObrasPorAcesso', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'implantacao' },
    { id: 'o2', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'sondagem' },
    { id: 'o3', regional_id: 'r2', status: 'em_andamento', tipo_obra: 'supervisao' },
    { id: 'o4', regional_id: 'r1', status: 'concluida', tipo_obra: 'implantacao' },
    { id: 'o5', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'conservacao' },
  ];
  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: [] },
  ];

  it('admin vê implantacao, conservacao e supervisao', () => {
    const user = { role: 'admin', email: 'admin@test.com' };
    const resultado = filtrarObrasPorAcesso(obras, regionais, user);
    expect(resultado.map(o => o.id)).toEqual(['o1', 'o3', 'o5']);
  });

  it('user vê apenas obras da sua regional em andamento (implantacao/supervisao)', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const resultado = filtrarObrasPorAcesso(obras, regionais, user);
    expect(resultado.map(o => o.id)).toEqual(['o1']);
  });

  it('user sem regional retorna array vazio', () => {
    const user = { role: 'user', email: 'desconhecido@test.com' };
    expect(filtrarObrasPorAcesso(obras, regionais, user)).toEqual([]);
  });
});

// ─── filtrarProjetosPorObra ───────────────────────────────────────────────────
describe('filtrarProjetosPorObra', () => {
  const projetos = [
    { id: 'p1', tipo_projeto: 'CAUQ', regional_id: 'r1' },
    { id: 'p2', tipo_projeto: 'MRAF', regional_id: 'r1' },
    { id: 'p3', tipo_projeto: 'CAUQ', regional_id: 'r2' },
  ];
  const obras = [{ id: 'o1', regional_id: 'r1' }];
  const regionais = [{ id: 'r1', project_ids: ['p1'] }];

  it('retorna apenas projetos CAUQ da regional da obra', () => {
    const resultado = filtrarProjetosPorObra(projetos, 'o1', obras, regionais);
    expect(resultado.map(p => p.id)).toEqual(['p1']);
  });

  it('retorna array vazio quando obra não encontrada', () => {
    expect(filtrarProjetosPorObra(projetos, 'x999', obras, regionais)).toEqual([]);
  });

  it('retorna array vazio quando regional sem project_ids', () => {
    const reg = [{ id: 'r1' }];
    expect(filtrarProjetosPorObra(projetos, 'o1', obras, reg)).toEqual([]);
  });
});