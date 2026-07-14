import { loadAuxData } from '@/services/recordsService';
import { listarFaixas } from '@/services/faixasService';
import { saveDataCache } from '@/services/offlineStorageService';
import { logger } from '@/utils/logger';

/**
 * Prepara o cache offline (IndexedDB) com o estado essencial do sistema.
 * Roda em background a cada abertura do app com rede: obras, regionais,
 * projetos, usuários e faixas granulométricas ficam disponíveis offline.
 * Nunca sobrescreve o cache existente com listas vazias (falha de rede
 * silenciosa não pode apagar dados bons já salvos).
 */
export async function prepararCacheOffline(user) {
  if (!user) return;

  await saveDataCache('currentUser', user, 'auth');

  try {
    const auxData = await loadAuxData({ needsRegionais: true, needsUsers: true });
    const hasData = auxData.obras.length > 0 || auxData.regionais.length > 0 || auxData.projects.length > 0;
    if (hasData) {
      await Promise.all([
        saveDataCache('auxData:R', { ...auxData, users: [] }, 'auxData'),
        saveDataCache('auxData:RU', auxData, 'auxData'),
        saveDataCache('auxData:obras', auxData.obras, 'auxData'),
        saveDataCache('auxData:regionais', auxData.regionais, 'auxData'),
        saveDataCache('auxData:projects', auxData.projects, 'auxData'),
      ]);
      logger.log('[offlineCache] Dados essenciais preparados para uso offline');
    } else {
      logger.warn('[offlineCache] Dados auxiliares vieram vazios — cache anterior preservado');
    }
  } catch (error) {
    logger.warn('[offlineCache] Não foi possível atualizar todos os dados offline:', error?.message);
  }

  // Faixas granulométricas — necessárias nos formulários de ensaio offline
  try {
    const faixas = await listarFaixas();
    if (faixas?.length) {
      await saveDataCache('auxData:faixas', faixas, 'auxData');
    }
  } catch (error) {
    logger.warn('[offlineCache] Não foi possível cachear faixas:', error?.message);
  }
}