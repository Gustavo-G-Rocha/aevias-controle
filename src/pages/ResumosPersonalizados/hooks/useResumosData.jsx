import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { listarObrasRecentes } from "@/services/obrasService";
import { listarRegionais } from "@/services/regionaisService";
import { listarProjects } from "@/services/projectsService";
import { filtrarRegistros } from "@/services/recordsService";
import { CAMPOS_POR_TIPO, TIPOS_ENSAIO } from "../constants/camposPorTipo";
import { filtrarObrasPorAcesso } from "../utils/resumosUtils";
import { processarEnsaio } from "../utils/processarEnsaio";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

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
        const userData = await obterUsuarioAtual();
        setUser(userData);
        const userAccessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');
        const [obrasData, regionaisData] = await Promise.all([
          listarObrasRecentes(),
          listarRegionais(),
        ]);
        setRegionais(regionaisData);
        const availableObras = filtrarObrasPorAcesso(obrasData, regionaisData, userAccessLevel, userData.email);
        setObras(availableObras);
        if (availableObras.length === 1) setObraId(availableObras[0].id);
      } catch (error) {
        logger.error("[ResumosPersonalizados] Erro ao carregar dados iniciais:", error?.message || error);
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

  // ── Carregar dados ─────────────────────────────────────────────────────────
  const carregarDados = useCallback(async () => {
    if (!obraId || !tipoEnsaioSelecionado) {
      toast({ title: "Selecione uma obra e um tipo de ensaio.", variant: "destructive" });
      return;
    }

    setLoadingData(true);
    try {
      const tipo = tipoEnsaioSelecionado;
      const campos = CAMPOS_POR_TIPO[tipo].map(c => c.key);
      const ensaios = await filtrarRegistros(tipo, { obra_id: obraId });

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
        todosOsProjetos = await listarProjects();
      }

      const peneirasRelevantes = (tipo === 'EnsaioCAUQ' || tipo === 'EnsaioMRAF')
        ? (CAMPOS_POR_TIPO[tipo].find(c => c.key === 'granulometria')?.subfields || [])
        : [];

      const resultados = [];
      ensaiosFiltrados.forEach(ensaio => {
        const linhas = processarEnsaio(ensaio, tipo, campos, todosOsProjetos, peneirasRelevantes);
        resultados.push(...linhas);
      });

      setDadosConsolidados(resultados);
      setRawEnsaios(ensaiosFiltrados);
    } catch (error) {
      logger.error("[ResumosPersonalizados] Erro ao carregar ensaios:", error?.message || error);
      toast({ title: "Erro ao carregar dados dos ensaios: " + (error?.message || error), variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro]);

  return {
    user, obras, regionais, loading, loadingData,
    obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro,
    dadosConsolidados, laboratoristas, rawEnsaios,
    setDataInicio, setDataFim, setLaboratoristaFiltro,
    handleObraChange, handleTipoEnsaioChange, carregarDados,
  };
}