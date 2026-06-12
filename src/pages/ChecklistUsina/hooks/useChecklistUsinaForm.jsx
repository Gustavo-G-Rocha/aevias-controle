import { useCallback } from "react";

/**
 * Hook de estado e handlers para o formulário de Checklist Usina.
 * Mantém toda lógica de manipulação de estado fora do JSX.
 */
export function useChecklistUsinaForm({ formData, setFormData, projects, faixas, selectedProject }) {

  // ── handlers simples ────────────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleObraChange = useCallback((obraId) => {
    setFormData(prev => ({ ...prev, obra_id: obraId, project_id: "" }));
  }, [setFormData]);

  // ── projeto ─────────────────────────────────────────────────────────────────
  const handleProjectChange = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      setFormData(prev => ({ ...prev, project_id: "" }));
      return;
    }
    const faixa = faixas.find(f => f.id === project.faixa_granulometrica_id);
    const pedreiras = project.agregados && Array.isArray(project.agregados)
      ? [...new Set(project.agregados.map(ag => ag.pedreira).filter(Boolean))].join(' + ')
      : "";

    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      faixa_especificada: faixa ? faixa.nome : "Não definida",
      ligante: project.ligante?.tipo || "",
      pedreira: pedreiras,
      controle_agregados: (project.agregados || []).map(ag => ({
        nome: ag.nome,
        estoque_coberto: false,
        estoque_coberto_qtde: 0,
        material_homogeneizado: false,
        material_homogeneizado_qtde: 0,
        granulometria_individual: false,
        granulometria_individual_qtde: 0,
      })),
      controle_ligante: {
        ...prev.controle_ligante,
        fornecedor: project.ligante?.fornecedor || "",
      },
    }));
  }, [projects, faixas, setFormData]);

  // ── agregados ────────────────────────────────────────────────────────────────
  const handleAgregadoChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newAgregados = [...prev.controle_agregados];
      newAgregados[index] = { ...newAgregados[index], [field]: value };
      return { ...prev, controle_agregados: newAgregados };
    });
  }, [setFormData]);

  // ── equivalente areia ────────────────────────────────────────────────────────
  const handleEquivalenteAreiaAddResultado = useCallback(() => {
    setFormData(prev => {
      if ((prev.equivalente_areia_resultados?.length || 0) >= 3) return prev;
      return {
        ...prev,
        equivalente_areia_resultados: [...(prev.equivalente_areia_resultados || []), null],
        equivalente_areia_quantidade: (prev.equivalente_areia_resultados?.length || 0) + 1,
      };
    });
  }, [setFormData]);

  const handleEquivalenteAreiaRemoveResultado = useCallback((index) => {
    setFormData(prev => {
      const novosResultados = prev.equivalente_areia_resultados.filter((_, i) => i !== index);
      return { ...prev, equivalente_areia_resultados: novosResultados, equivalente_areia_quantidade: novosResultados.length };
    });
  }, [setFormData]);

  const handleEquivalenteAreiaResultadoChange = useCallback((index, valor) => {
    setFormData(prev => {
      const novosResultados = [...(prev.equivalente_areia_resultados || [])];
      const parsedValue = valor ? parseFloat(valor) : null;
      if (parsedValue !== null && parsedValue < 0) return prev;
      novosResultados[index] = parsedValue;
      return { ...prev, equivalente_areia_resultados: novosResultados };
    });
  }, [setFormData]);

  // ── rodadas ──────────────────────────────────────────────────────────────────
  const handleRodadaChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newRodadas = [...prev.rodadas_producao];
      newRodadas[index] = { ...newRodadas[index], [field]: value };
      return { ...prev, rodadas_producao: newRodadas };
    });
  }, [setFormData]);

  const adicionarRodada = useCallback(() => {
    setFormData(prev => {
      if (prev.rodadas_producao.length >= 4) return prev;
      return {
        ...prev,
        rodadas_producao: [...prev.rodadas_producao, {
          numero_rodada: prev.rodadas_producao.length + 1,
          horario_inicio: "", horario_termino: "",
          temperatura_ambiente: null, condicoes_climaticas: "bom",
          quantidade_produzida: null, controle_cargas_sim: false,
          controle_cargas_qtde: 0, caminhoes_enlonados: false,
          temperatura_massa_t1: null, temperatura_massa_t2: null,
        }],
      };
    });
  }, [setFormData]);

  const removerRodada = useCallback((index) => {
    setFormData(prev => {
      if (prev.rodadas_producao.length <= 1) return prev;
      return { ...prev, rodadas_producao: prev.rodadas_producao.filter((_, i) => i !== index) };
    });
  }, [setFormData]);

  // ── nested (ligante + controle_cauq) ─────────────────────────────────────────
  const checkConformidadeAutomatica = useCallback((testKey, resultado, project) => {
    if (!project || resultado === null || resultado === undefined || resultado === '') return null;
    if (testKey === 'granulometria') return null;
    const num = parseFloat(resultado);
    if (isNaN(num)) return null;
    const checks = {
      extracao_ligante_rotarex: () => project.teor_ligante && num >= project.teor_ligante.min && num <= project.teor_ligante.max,
      extracao_ligante_soxhlet: () => project.teor_ligante && num >= project.teor_ligante.min && num <= project.teor_ligante.max,
      volume_vazios: () => project.volume_vazios && num >= project.volume_vazios.min && num <= project.volume_vazios.max,
      vam_marshall: () => project.vam && num > project.vam.min,
      rbv: () => project.rbv && num >= project.rbv.min && num <= project.rbv.max,
      rtcd_25c: () => project.rtcd && num > project.rtcd.min,
      estabilidade: () => project.estabilidade && num > project.estabilidade.min,
      fluencia: () => project.fluencia && num >= project.fluencia.min && num <= project.fluencia.max,
    };
    return checks[testKey]?.() ?? null;
  }, []);

  const handleNestedChange = useCallback((sectionOrPath, fieldOrValue, valueOrDecimals = null) => {
    if (typeof fieldOrValue === 'string' && !sectionOrPath.includes('.')) {
      setFormData(prev => ({
        ...prev,
        [sectionOrPath]: { ...prev[sectionOrPath], [fieldOrValue]: valueOrDecimals },
      }));
      return;
    }

    const path = sectionOrPath;
    const value = fieldOrValue;
    const decimals = valueOrDecimals;

    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      if (keys[0] !== 'controle_cauq') return newData;

      const testKey = keys[1];
      const testObject = newData.controle_cauq[testKey];
      if (!Array.isArray(testObject.resultados)) testObject.resultados = [];

      if (keys[2] === 'resultados' && keys.length === 4) {
        const resultIndex = parseInt(keys[3]);
        while (testObject.resultados.length <= resultIndex) testObject.resultados.push(null);
        const novos = [...testObject.resultados];

        const normalizedValue = typeof value === 'string' ? value.replace(',', '.') : String(value ?? '');
        const parsedValue = normalizedValue !== '' ? parseFloat(normalizedValue) : null;
        novos[resultIndex] = parsedValue;
        testObject.resultados = novos;

        if (testObject.quantidade === 1 && ('conforme' in testObject) && testKey !== 'granulometria') {
          const conf = checkConformidadeAutomatica(testKey, parsedValue, selectedProject);
          testObject.conforme = conf !== null ? conf : null;
        }

      } else if (keys[2] === 'realizado') {
        testObject.realizado = value;
        if (!value) {
          testObject.quantidade = 0;
          testObject.resultados = [];
          if ('conforme' in testObject) testObject.conforme = null;
        }

      } else if (keys[2] === 'quantidade') {
        const newQ = Math.min(parseInt(value) || 0, 3);
        const oldQ = testObject.quantidade || 0;
        testObject.quantidade = newQ;

        if (newQ > testObject.resultados.length) {
          testObject.resultados = [...testObject.resultados, ...Array(newQ - testObject.resultados.length).fill(null)];
        } else {
          testObject.resultados = testObject.resultados.slice(0, newQ);
        }

        if (oldQ === 1 && newQ > 1 && ('conforme' in testObject)) testObject.conforme = null;
        if (newQ === 0 && ('conforme' in testObject)) testObject.conforme = null;
        if (newQ === 1 && ('conforme' in testObject) && testObject.resultados.length > 0 && testKey !== 'granulometria') {
          const conf = checkConformidadeAutomatica(testKey, testObject.resultados[0], selectedProject);
          testObject.conforme = conf !== null ? conf : null;
        }

      } else if (keys[2] === 'conforme') {
        if (testObject.quantidade !== 1 || testKey === 'granulometria') testObject.conforme = value;
      }

      return newData;
    });
  }, [setFormData, checkConformidadeAutomatica, selectedProject]);

  return {
    handleChange,
    handleObraChange,
    handleProjectChange,
    handleAgregadoChange,
    handleEquivalenteAreiaAddResultado,
    handleEquivalenteAreiaRemoveResultado,
    handleEquivalenteAreiaResultadoChange,
    handleRodadaChange,
    adicionarRodada,
    removerRodada,
    handleNestedChange,
  };
}