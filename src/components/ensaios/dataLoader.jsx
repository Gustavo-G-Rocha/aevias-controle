// dataLoader.jsx — Carregamento de dados para MeusEnsaios / useEnsaiosList
// ETAPA 7: usa recordsService como fonte única, eliminando ~120 linhas duplicadas
// A ordenação por data de ensaio permanece intacta.

import { base44 } from '@/api/base44Client';
import { loadAllRecords, loadAuxData } from '@/services/recordsService';
import { getDataEnsaio } from './ensaioMappers';

function sortByEnsaioDate(records) {
  return records.sort((a, b) => {
    const dateA = new Date(getDataEnsaio(a));
    const dateB = new Date(getDataEnsaio(b));
    const aValid = !isNaN(dateA.getTime());
    const bValid = !isNaN(dateB.getTime());

    if (aValid && bValid) {
      const diff = dateB.getTime() - dateA.getTime();
      if (diff !== 0) return diff;
      return new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime();
    }
    if (!aValid) return 1;
    if (!bValid) return -1;
    return 0;
  });
}

export const loadAllData = async () => {
  const currentUser = await base44.auth.me();
  const currentUserAccessLevel =
    currentUser.access_level || (currentUser.role === 'admin' ? 'admin' : 'user');

  // Carregar todos os registros + dados auxiliares em paralelo
  const [allRecords, { obras: obrasData, projects: projectsData, regionais: regionaisData, users: allUsers }] =
    await Promise.all([
      loadAllRecords('list'),
      loadAuxData({ needsRegionais: true, needsUsers: true }),
    ]);

  const combinedEnsaios = sortByEnsaioDate(allRecords);

  return {
    currentUser,
    allUsers,
    currentUserAccessLevel,
    obrasData,
    regionaisData,
    projectsData,
    combinedEnsaios,
  };
};