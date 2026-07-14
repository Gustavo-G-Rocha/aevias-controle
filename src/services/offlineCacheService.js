import { loadAuxData } from '@/services/recordsService';
import { saveDataCache } from '@/services/offlineStorageService';
import { logger } from '@/utils/logger';

export async function prepararCacheOffline(user) {
  if (!user) return;

  await saveDataCache('currentUser', user, 'auth');

  try {
    const auxData = await loadAuxData({ needsRegionais: true, needsUsers: true });
    await Promise.all([
      saveDataCache('auxData:R', { ...auxData, users: [] }, 'auxData'),
      saveDataCache('auxData:RU', auxData, 'auxData'),
      saveDataCache('auxData:obras', auxData.obras, 'auxData'),
      saveDataCache('auxData:regionais', auxData.regionais, 'auxData'),
      saveDataCache('auxData:projects', auxData.projects, 'auxData'),
    ]);
    logger.log('[offlineCache] Dados essenciais preparados para uso offline');
  } catch (error) {
    logger.warn('[offlineCache] Não foi possível atualizar todos os dados offline:', error?.message);
  }
}