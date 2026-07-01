/**
 * Hook de carregamento de registros para RelatorioUnificado.
 * Busca e filtra registros por tipo, período e critérios adicionais.
 */
import { useState, useEffect, useRef } from 'react';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { getEntityInstance } from '@/utils/relatorioUnificadoEntityMap';

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

        // Busca todos os tipos em paralelo
        const results = await Promise.allSettled(
          tiposArray.map(async (tipo) => {
            const entity = getEntityInstance(tipo);
            if (!entity) {
              console.warn(`[RelatorioUnificado] Tipo "${tipo}" não suportado.`);
              return [];
            }
            const raw = await entity
              .filter({ obra_id: filters.filters.obra_id }, '-created_date', 2000)
              .catch(err => {
                console.warn(`[RelatorioUnificado] Falha ao buscar ${tipo}:`, err?.message || err);
                return [];
              });
            return (Array.isArray(raw) ? raw : []).map(r => ({ ...r, entityType: tipo }));
          })
        );

        const allRecords = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

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
        console.error('Erro ao carregar registros:', err);
        setError('Erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [filterKey]);

  return { records, loading, error };
}