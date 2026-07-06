/**
 * Hook de carregamento de registros para RelatorioUnificado.
 * Busca e filtra registros por tipo, período e critérios adicionais.
 */
import { useState, useEffect, useRef } from 'react';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { filtrarRegistros } from '@/services/recordsService';
import { isTipoSuportado } from '@/utils/relatorioUnificadoEntityMap';
import { logger } from '@/utils/logger';

export function useRelatorioUnificadoRecords(filters) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify para evitar disparos em loop por nova referência de objeto
  const filterKey = JSON.stringify(filters);
  const prevKeyRef = useRef(null);

  useEffect(() => {
    if (prevKeyRef.current === filterKey) return;
    prevKeyRef.current = filterKey;

    const loadRecords = async () => {
      if (!filters.hasValidFilters) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Suporta 'tipos' (array, multi-seleção) com fallback para 'tipo' (legado)
        const tiposArray = filters.filters.tipos?.length
          ? filters.filters.tipos
          : filters.filters.tipo
            ? [filters.filters.tipo]
            : [];

        if (tiposArray.length === 0) {
          setError('Nenhum tipo de registro selecionado.');
          setLoading(false);
          return;
        }

        // Busca todos os tipos suportados em paralelo via service centralizado
        const tiposValidos = tiposArray.filter(isTipoSuportado);
        tiposArray.forEach(t => {
          if (!isTipoSuportado(t)) logger.warn(`[RelatorioUnificado] Tipo "${t}" não suportado.`);
        });

        const rawByType = await Promise.all(
          tiposValidos.map(t =>
            filtrarRegistros(t, { obra_id: filters.filters.obra_id }, '-created_date', 2000)
              .then(rows => (Array.isArray(rows) ? rows : []).map(r => ({ ...r, entityType: t })))
          )
        );

        const allRecords = rawByType.flat();

        // Filtrar por período
        const inicio = new Date(filters.filters.data_inicio);
        const fim = new Date(filters.filters.data_fim);
        fim.setHours(23, 59, 59);

        const filtered = allRecords
          .filter(r => {
            const d = getDataEnsaio(r);
            if (!d) return false;
            const date = new Date(d);
            return date >= inicio && date <= fim;
          })
          .filter(r => {
            if (!filters.filters.laboratoristas.length) return true;
            // O registro pode ter sido salvo sem laboratorista_name; nesse caso
            // a lista pode conter tanto o nome quanto o email (created_by).
            // Aceita se qualquer um dos identificadores do registro casar.
            const identificadores = [r.laboratorista_name, r.created_by].filter(Boolean);
            return identificadores.some(id => filters.filters.laboratoristas.includes(id));
          })
          .filter(r => {
            if (!filters.filters.rodovia) return true;
            const rodoviaRecord = r.rodovia || r.rodovia_selecionada;
            return rodoviaRecord === filters.filters.rodovia;
          })
          .filter(r => {
            if (!filters.filters.empreiteira) return true;
            const empreiteiraRecord = r.empreiteira || r.empreiteira_selecionada;
            return empreiteiraRecord === filters.filters.empreiteira;
          })
          .filter(r => {
            if (!filters.filters.usina) return true;
            const usinaRecord = r.usina || r.usina_selecionada || r.usina_fornecedora;
            return usinaRecord === filters.filters.usina;
          })
          .sort((a, b) => {
            const da = new Date(getDataEnsaio(a) || 0);
            const db = new Date(getDataEnsaio(b) || 0);
            return da - db;
          });

        setRecords(filtered);
        setError(null);
      } catch (err) {
        logger.error('Erro ao carregar registros:', err);
        setError('Erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [filterKey]);

  return { records, loading, error };
}