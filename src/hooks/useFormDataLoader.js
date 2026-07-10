import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listarFaixas } from "@/services/faixasService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";

/**
 * Hook base compartilhado que encapsula a lógica comum de carregamento de
 * dados para formulários de ensaio e checklist (AR4).
 *
 * Extraído de useEnsaioForm e useChecklistForm para eliminar a duplicação
 * de: carregar usuário, dados auxiliares (obras/regionais/projetos),
 * faixas granulométricas, filtragem de obras por acesso, editId da URL
 * e valores derivados (obraSelecionada, regionalSelecionada, projetosDisponiveis).
 *
 * Cada hook consumidor mantém suas particularidades (entity loader,
 * normalização de datas, permissões, merge de campos) no próprio corpo.
 *
 * @param {Object}   options
 * @param {Object}   options.formData       — estado do formulário (para derivar obraSelecionada)
 * @param {boolean}  [options.needsUsers]   — se deve carregar lista de usuários (checklist)
 * @param {string[]|null} [options.filtroTipoObra] — filtra obras por tipo_obra
 * @param {boolean}  [options.useAccessLevel] — true: usa access_level (ensaio); false: usa role === 'admin' (checklist)
 */
export function useFormDataLoader({
  formData,
  needsUsers = false,
  filtroTipoObra = null,
  useAccessLevel = false,
} = {}) {
  const location = useLocation();

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers });

  // FaixaGranulometrica — cache próprio (não está no useAuxData)
  const { data: faixas } = useQuery({
    queryKey: ['faixasGranulometricas'],
    queryFn: () => listarFaixas(),
    staleTime: 10 * 60 * 1000,
  });

  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];

    // Determina se o usuário deve ver apenas obras das suas regionais.
    // useAccessLevel=true (ensaio): access_level 'user' é laboratorista.
    // useAccessLevel=false (checklist): role !== 'admin' é laboratorista.
    const isLaboratorista = useAccessLevel
      ? ['user', 'funcionarios_cliente'].includes(user.access_level || (user.role === 'admin' ? 'admin' : 'user'))
      : user.role !== 'admin';

    if (isLaboratorista) {
      const emailLower = user.email.toLowerCase();
      const regionaisIds = regionais
        .filter(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        )
        .map(r => r.id);
      if (regionaisIds.length > 0) {
        const regionaisSet = new Set(regionaisIds);
        return auxData.obras.filter(obra =>
          regionaisSet.has(obra.regional_id) &&
          obra.status === 'em_andamento' &&
          (filtroTipoObra ? filtroTipoObra.includes(obra.tipo_obra) : true)
        );
      }
      return [];
    }

    // Não-laboratorista: aplica filtroTipoObra se fornecido, senão retorna todas
    if (filtroTipoObra) {
      return auxData.obras.filter(obra => filtroTipoObra.includes(obra.tipo_obra));
    }
    return auxData.obras;
  }, [auxData?.obras, regionais, user, filtroTipoObra, useAccessLevel]);

  // editId derivado de location.search — estável enquanto o parâmetro não muda
  const editId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('editId');
  }, [location.search]);

  const obraSelecionada = useMemo(
    () => obras.find(o => o.id === formData.obra_id),
    [obras, formData.obra_id]
  );
  const regionalSelecionada = useMemo(
    () => obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null,
    [obraSelecionada, regionais]
  );
  const projetosDisponiveis = useMemo(() => {
    if (!regionalSelecionada || !projects) return [];
    return projects.filter(p =>
      (regionalSelecionada.project_ids || []).includes(p.id) &&
      p.status === 'ativo'
    );
  }, [regionalSelecionada, projects]);

  const loading = loadingUser || loadingAux;

  return {
    user,
    loadingUser,
    loadingAux,
    auxData,
    regionais,
    projects,
    faixas: faixas ?? [],
    obras,
    editId,
    loading,
    obraSelecionada,
    regionalSelecionada,
    projetosDisponiveis,
  };
}