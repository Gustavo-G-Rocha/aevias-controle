import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listarFaixas } from "@/services/faixasService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { saveDataCache, getDataCache } from "@/services/offlineStorageService";
import { ACCESS_LEVELS, USER_LIKE_LEVELS, getUserAccessLevel } from "@/lib/layoutConstants";

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
 * @param {boolean}  [options.useAccessLevel] — DEPRECADO/ignorado. O nível de
 *   acesso é sempre derivado de access_level (fallback para role), igual ao
 *   restante do app. Mantido apenas por compatibilidade com os call sites.
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
  // Online: busca e salva no IndexedDB; offline/falha de rede: lê do cache.
  const { data: faixas } = useQuery({
    queryKey: ['faixasGranulometricas'],
    queryFn: async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const cached = await getDataCache('auxData:faixas');
        return cached?.data ?? [];
      }
      try {
        const data = await listarFaixas();
        if (data?.length) saveDataCache('auxData:faixas', data, 'auxData').catch(() => {});
        return data;
      } catch (e) {
        const cached = await getDataCache('auxData:faixas');
        if (cached) return cached.data;
        throw e;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];

  const obraIdAtual = formData?.obra_id;

  const obrasBase = useMemo(() => {
    if (!auxData?.obras || !user) return [];

    // Determina se o usuário deve ver apenas obras das suas regionais.
    // O nível efetivo vem SEMPRE de access_level (com fallback para role),
    // igual ao resto do app (getUserAccessLevel / useLayoutData).
    //
    // Antes, os checklists (useAccessLevel=false) derivavam o nível apenas de
    // `role`: como gestor_contrato, sala_tecnica_afirmaevias,
    // cliente_supervisor e funcionarios_cliente têm role 'user' na
    // plataforma, todos eram tratados como laboratorista e filtrados por
    // `laboratoristas_responsaveis` — lista onde não constam. O resultado era
    // uma lista de obras vazia e a impossibilidade de usar as telas de novo
    // registro de checklist.
    const userAccessLevel = getUserAccessLevel(user);
    const isFuncionarioCliente = userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE;
    const isLaboratorista = USER_LIKE_LEVELS.includes(userAccessLevel);

    if (isLaboratorista) {
      const emailLower = user.email.toLowerCase();
      const supervisorEmailLower = user.supervisor_email?.toLowerCase();
      let regionaisIds;
      if (isFuncionarioCliente) {
        // funcionarios_cliente: regionais onde o supervisor OU o próprio email
        // está em clientes_responsaveis
        const emailsToCheck = new Set([emailLower]);
        if (supervisorEmailLower) emailsToCheck.add(supervisorEmailLower);
        regionaisIds = regionais
          .filter(r => (r.clientes_responsaveis || []).some(e => emailsToCheck.has(e.toLowerCase())))
          .map(r => r.id);
      } else {
        // user (laboratorista): regionais onde está alocado
        regionaisIds = regionais
          .filter(r =>
            (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
            (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
          )
          .map(r => r.id);
      }
      if (regionaisIds.length > 0) {
        const regionaisSet = new Set(regionaisIds);
        // funcionarios_cliente: vê obras de qualquer status (igual ao useLayoutData);
        // user (laboratorista): apenas obras em andamento
        const statusOk = isFuncionarioCliente ? () => true : (obra) => obra.status === 'em_andamento';
        return auxData.obras.filter(obra =>
          regionaisSet.has(obra.regional_id) &&
          statusOk(obra) &&
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
  }, [auxData?.obras, regionais, user, filtroTipoObra]);

  // Ao editar um registro existente, a obra já salva nele deve sempre aparecer
  // nas opções — mesmo que o filtro (regional/status/tipo) a exclua para este
  // usuário. Caso contrário o campo "Obra" renderiza vazio e o contexto
  // (regional, projetos) some, bloqueando a finalização.
  // Mantém a MESMA referência de obrasBase quando nada precisa ser adicionado,
  // para não redisparar efeitos que dependem da identidade de `obras`.
  const obras = useMemo(() => {
    if (obraIdAtual && auxData?.obras && !obrasBase.some(o => o.id === obraIdAtual)) {
      const atual = auxData.obras.find(o => o.id === obraIdAtual);
      if (atual) return [...obrasBase, atual];
    }
    return obrasBase;
  }, [obrasBase, obraIdAtual, auxData?.obras]);

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