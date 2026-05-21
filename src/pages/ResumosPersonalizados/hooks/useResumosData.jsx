import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { CAMPOS_POR_TIPO, TIPOS_ENSAIO } from "../constants/camposPorTipo";
import {
  filtrarObrasPorAcesso,
  getLabelTipo,
  getNestedValue,
  calcularMediaArray,
  formatValue,
  calcularGranulometriaPassante,
  processarSubfieldControleCauq,
  enriquecerManchaPendulo,
} from "../utils/resumosUtils";

export function useResumosData() {
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Filtros
  const [obraId, setObraId] = useState("");
  const [tipoEnsaioSelecionado, setTipoEnsaioSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [laboratoristaFiltro, setLaboratoristaFiltro] = useState("");

  // Dados gerados
  const [dadosConsolidados, setDadosConsolidados] = useState([]);
  const [laboratoristas, setLaboratoristas] = useState([]);
  const [rawEnsaios, setRawEnsaios] = useState([]);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        const userAccessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');
        const [obrasData, regionaisData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
        ]);
        setRegionais(regionaisData);
        const availableObras = filtrarObrasPorAcesso(obrasData, regionaisData, userAccessLevel, userData.email);
        setObras(availableObras);
        if (availableObras.length === 1) setObraId(availableObras[0].id);
      } catch (error) {
        console.error("[ResumosPersonalizados] Erro ao carregar dados iniciais:", error?.message || error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Handlers de filtro ─────────────────────────────────────────────────────
  const handleObraChange = useCallback((newObraId) => {
    setObraId(newObraId);
    setLaboratoristaFiltro("");
    setLaboratoristas([]);
    setDadosConsolidados([]);
  }, []);

  const handleTipoEnsaioChange = useCallback((tipo) => {
    setTipoEnsaioSelecionado(tipo);
    setLaboratoristaFiltro("");
    setLaboratoristas([]);
    setDadosConsolidados([]);
  }, []);

  // ── Geração de linhas por tipo ─────────────────────────────────────────────
  const processarEnsaio = useCallback((ensaio, tipo, campos, todosOsProjetos, peneirasRelevantes) => {
    const resultados = [];
    const label = getLabelTipo(tipo, TIPOS_ENSAIO);

    // Enriquecer ensaio com nome do projeto
    if (['EnsaioCAUQ', 'EnsaioSondagem', 'ChecklistUsina', 'ChecklistMRAF'].includes(tipo) && ensaio.project_id) {
      const projeto = todosOsProjetos.find(p => p.id === ensaio.project_id);
      ensaio.project_name = projeto?.name || '-';
      if (tipo === 'ChecklistUsina') ensaio.fornecedora_ligante = projeto?.ligante?.fornecedor || '-';
    }

    const criarLinha = (id, data) => ({ tipo: label, id, data });

    const preencherCampos = (linha, origem, origemPrincipal) => {
      campos.forEach(campoKey => {
        const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
        if (!campo) return;

        if (campoKey === 'granulometria' && campo.subfields) {
          const peneiras = peneirasRelevantes.length > 0 ? peneirasRelevantes : campo.subfields;
          peneiras.forEach(sf => {
            const v = calcularGranulometriaPassante(origemPrincipal || origem, sf.key);
            if (v !== null) linha[`granulometria.${sf.astm}`] = v;
          });
        } else if (campo.subfields && origem) {
          campo.subfields.forEach(sf => {
            const v = getNestedValue(origem, sf.key);
            linha[sf.label] = formatValue(v, sf.key);
          });
        } else {
          const v = getNestedValue(origemPrincipal || origem, campoKey);
          linha[campo.label] = formatValue(v, campoKey);
        }
      });
    };

    if (tipo === 'EnsaioSondagem') {
      (ensaio.corpos_prova || []).forEach((cp, idx) => {
        const linha = criarLinha(`${ensaio.id}_CP${idx + 1}`, ensaio.data_ensaio || ensaio.data || '-');
        campos.forEach(campoKey => {
          const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
          if (campoKey === 'corpos_prova') {
            campo.subfields.forEach(sf => { linha[sf.label] = formatValue(getNestedValue(cp, sf.key), sf.key); });
          } else {
            linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
          }
        });
        resultados.push(linha);
      });

    } else if (tipo === 'EnsaioDensidadeInSitu') {
      (ensaio.furos || []).forEach((furo, idx) => {
        const linha = criarLinha(`${ensaio.id}_Furo${idx + 1}`, ensaio.data_ensaio || ensaio.data || '-');
        campos.forEach(campoKey => {
          const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
          if (campoKey === 'furos' || campoKey === 'furos_variacao') {
            campo.subfields.forEach(sf => { linha[sf.label] = formatValue(getNestedValue(furo, sf.key), sf.key); });
          } else {
            linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
          }
        });
        resultados.push(linha);
      });

    } else if (tipo === 'EnsaioTaxaPinturaImprimacao') {
      (ensaio.ensaios || []).forEach((ens, idx) => {
        const linha = criarLinha(`${ensaio.id}_Ensaio${idx + 1}`, ensaio.data_ensaio || '-');
        campos.forEach(campoKey => {
          const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
          if (campoKey === 'ensaios') {
            campo.subfields.forEach(sf => { linha[sf.label] = formatValue(getNestedValue(ens, sf.key), sf.key); });
          } else {
            linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
          }
        });
        resultados.push(linha);
      });

    } else if (tipo === 'ChecklistConcretagem') {
      const cargas = ensaio.cargas_concreto || [];
      const gerarLinhaConcretagem = (carga, id) => {
        const linha = criarLinha(id, formatValue(ensaio.data, 'data'));
        campos.forEach(campoKey => {
          const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
          if (campoKey === 'cargas_concreto' && carga) {
            campo.subfields.forEach(sf => {
              if (sf.key.startsWith('qtd_cps_') || sf.key.startsWith('tipo_ruptura_')) {
                const dias = parseInt(sf.key.match(/\d+/)[0]);
                const cps = carga.corpos_prova || [];
                if (sf.key.startsWith('qtd_cps_')) {
                  const qtd = cps.filter(cp => cp.dias_ruptura === dias).length;
                  linha[sf.label] = qtd > 0 ? qtd : '-';
                } else {
                  const tipos = cps.filter(cp => cp.dias_ruptura === dias).map(cp => {
                    if (cp.tipo_ruptura === 'compressao_axial') return 'Compressão Axial';
                    if (cp.tipo_ruptura === 'comp_diametral') return 'Compressão Diametral';
                    if (cp.tipo_ruptura === 'tracao_flexao') return 'Tração Flexão';
                    return cp.tipo_ruptura;
                  });
                  linha[sf.label] = tipos.length > 0 ? tipos.join(', ') : '-';
                }
              } else {
                linha[sf.label] = formatValue(getNestedValue(carga, sf.key), sf.key);
              }
            });
          } else {
            linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
          }
        });
        return linha;
      };

      if (cargas.length > 0) {
        cargas.forEach((carga, idx) => resultados.push(gerarLinhaConcretagem(carga, `${ensaio.id}_Carga${idx + 1}`)));
      } else {
        const linha = criarLinha(ensaio.id, formatValue(ensaio.data, 'data'));
        campos.forEach(campoKey => {
          const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
          if (campo?.subfields) campo.subfields.forEach(sf => { linha[sf.label] = '-'; });
          else linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
        });
        resultados.push(linha);
      }

    } else if (tipo === 'ChecklistUsina') {
      const rodadas = ensaio.rodadas_producao || [];
      const gerarLinhaUsina = (rodada, id) => {
        const linha = criarLinha(id, formatValue(ensaio.data, 'data'));
        campos.forEach(campoKey => {
          const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
          if (campoKey === 'equivalente_areia_resultados') {
            const eaRes = ensaio.equivalente_areia_resultados || [];
            campo.subfields.forEach((sf, sfIdx) => {
              linha[sf.label] = eaRes[sfIdx] !== undefined ? formatValue(eaRes[sfIdx], 'number') : '-';
            });
          } else if (campoKey === 'rodadas_producao' && rodada) {
            campo.subfields.forEach(sf => { linha[sf.label] = formatValue(getNestedValue(rodada, sf.key), sf.key); });
          } else if (campoKey === 'controle_cauq') {
            const cauq = ensaio.controle_cauq || {};
            campo.subfields.forEach(sf => { linha[sf.label] = formatValue(processarSubfieldControleCauq(sf, cauq), sf.key); });
          } else if (campo?.subfields && !rodada) {
            const arr = getNestedValue(ensaio, campoKey);
            campo.subfields.forEach(sf => {
              const media = calcularMediaArray(arr, sf.key);
              linha[sf.label] = media !== null ? media : '-';
            });
          } else {
            linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
          }
        });
        return linha;
      };

      if (rodadas.length > 0) {
        rodadas.forEach((rodada, idx) => resultados.push(gerarLinhaUsina(rodada, `${ensaio.id}_Rodada${idx + 1}`)));
      } else {
        resultados.push(gerarLinhaUsina(null, ensaio.id));
      }

    } else if (tipo === 'ChecklistTerraplanagem' || tipo === 'ChecklistReciclagem') {
      const linha = criarLinha(ensaio.id, ensaio.data_ensaio || ensaio.data || '-');
      campos.forEach(campoKey => {
        const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
        if (campoKey === 'variacao_umidade_valor') {
          const uo = ensaio.umidade_otima_proctor;
          const uis = ensaio.umidade_in_situ;
          linha[campo.label] = (uo != null && uis != null) ? (uis - uo).toFixed(2) : '-';
        } else if (campoKey === 'grau_compactacao_valor') {
          const dp = ensaio.ensaios_empreiteira?.compactacao_proctor?.resultados;
          const dis = ensaio.ensaios_empreiteira?.massa_especifica_in_situ?.resultados;
          if (dp && dis) {
            const dProc = Array.isArray(dp) ? parseFloat(dp[0]) : parseFloat(dp);
            const dIS = Array.isArray(dis) ? parseFloat(dis[0]) : parseFloat(dis);
            linha[campo.label] = (!isNaN(dProc) && !isNaN(dIS) && dProc > 0)
              ? ((dIS / dProc) * 100).toFixed(2) : '-';
          } else {
            linha[campo.label] = '-';
          }
        } else if (campo?.subfields) {
          const arr = getNestedValue(ensaio, campoKey);
          campo.subfields.forEach(sf => {
            const media = calcularMediaArray(arr, sf.key);
            linha[`${campoKey}.${sf.key}`] = media !== null ? media : '-';
          });
        } else {
          linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
        }
      });
      resultados.push(linha);

    } else {
      // Tipos genéricos (EnsaioCAUQ, EnsaioManchaPendulo, ChecklistAplicacao, ChecklistMRAF, DiarioObra, etc.)
      if (tipo === 'EnsaioManchaPendulo') enriquecerManchaPendulo(ensaio);

      const linha = criarLinha(ensaio.id, ensaio.data_ensaio || ensaio.data || ensaio.extraction_date || '-');
      campos.forEach(campoKey => {
        const campo = CAMPOS_POR_TIPO[tipo].find(c => c.key === campoKey);
        if (!campo) return;
        if (campo.subfields) {
          if (campoKey === 'granulometria') {
            const peneiras = peneirasRelevantes.length > 0 ? peneirasRelevantes : campo.subfields;
            peneiras.forEach(sf => {
              const v = calcularGranulometriaPassante(ensaio, sf.key);
              if (v !== null) linha[`granulometria.${sf.astm}`] = v;
            });
          } else {
            const arr = getNestedValue(ensaio, campoKey);
            campo.subfields.forEach(sf => {
              const media = calcularMediaArray(arr, sf.key);
              linha[`${campoKey}.${sf.key}`] = media !== null ? media : '-';
            });
          }
        } else {
          linha[campo.label] = formatValue(getNestedValue(ensaio, campoKey), campoKey);
        }
      });
      resultados.push(linha);
    }

    return resultados;
  }, []);

  // ── Carregar dados ─────────────────────────────────────────────────────────
  const carregarDados = useCallback(async () => {
    if (!obraId || !tipoEnsaioSelecionado) {
      alert("Selecione uma obra e um tipo de ensaio.");
      return;
    }

    setLoadingData(true);
    try {
      const tipo = tipoEnsaioSelecionado;
      const campos = CAMPOS_POR_TIPO[tipo].map(c => c.key);
      const ensaios = await base44.entities[tipo].filter({ obra_id: obraId });

      // Filtrar por data / laboratorista
      let ensaiosFiltrados = ensaios;
      if (dataInicio || dataFim || laboratoristaFiltro) {
        ensaiosFiltrados = ensaios.filter(e => {
          const dataEnsaio = e.data_ensaio || e.data || e.extraction_date;
          if (dataInicio || dataFim) {
            if (!dataEnsaio) return false;
            const d = new Date(dataEnsaio);
            if (dataInicio && d < new Date(dataInicio)) return false;
            if (dataFim && d > new Date(dataFim)) return false;
          }
          if (laboratoristaFiltro && e.laboratorista_name !== laboratoristaFiltro) return false;
          return true;
        });
      }

      // Coletar laboratoristas únicos
      const labsUnicos = new Set();
      ensaios.forEach(e => { if (e.laboratorista_name) labsUnicos.add(e.laboratorista_name); });
      setLaboratoristas(Array.from(labsUnicos).sort());

      // Carregar projetos se necessário
      let todosOsProjetos = [];
      if (['EnsaioCAUQ', 'EnsaioSondagem', 'ChecklistUsina', 'ChecklistMRAF'].includes(tipo)) {
        todosOsProjetos = await base44.entities.Project.list();
      }

      const peneirasRelevantes = tipo === 'EnsaioCAUQ'
        ? (CAMPOS_POR_TIPO.EnsaioCAUQ.find(c => c.key === 'granulometria')?.subfields || [])
        : [];

      const resultados = [];
      ensaiosFiltrados.forEach(ensaio => {
        const linhas = processarEnsaio(ensaio, tipo, campos, todosOsProjetos, peneirasRelevantes);
        resultados.push(...linhas);
      });

      setDadosConsolidados(resultados);
      setRawEnsaios(ensaiosFiltrados);
    } catch (error) {
      console.error("[ResumosPersonalizados] Erro ao carregar ensaios:", error?.message || error);
      alert("Erro ao carregar dados dos ensaios: " + (error?.message || error));
    } finally {
      setLoadingData(false);
    }
  }, [obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro, processarEnsaio]);

  return {
    user, obras, regionais, loading, loadingData,
    obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro,
    dadosConsolidados, laboratoristas, rawEnsaios,
    setDataInicio, setDataFim, setLaboratoristaFiltro,
    handleObraChange, handleTipoEnsaioChange, carregarDados,
  };
}