/**
 * Pré-baixa em background os chunks das telas usadas em campo, para que
 * funcionem offline sem o usuário precisar abrir cada uma antes.
 * O service worker guarda cada chunk baixado no cache do dispositivo.
 */
import { logger } from '@/utils/logger';
import { REPORT_PAGE_LOADERS } from '@/lib/prefetchReportPages';

const FIELD_PAGES = [
  () => import('@/pages/DiarioObra/index'),
  () => import('@/pages/MeusEnsaios'),
  () => import('@/pages/ChecklistAplicacao/index'),
  () => import('@/pages/ChecklistConcretagem/index'),
  () => import('@/pages/ChecklistMRAF'),
  () => import('@/pages/ChecklistReciclagem/index'),
  () => import('@/pages/ChecklistTerraplanagem/index'),
  () => import('@/pages/ChecklistUsina/index'),
  () => import('@/pages/AcompanhamentoCarga'),
  () => import('@/pages/AcompanhamentoUsinagem'),
  () => import('@/pages/EnsaioCAUQ/index'),
  () => import('@/pages/EnsaioDensidadeInSitu'),
  () => import('@/pages/EnsaioGranulometriaIndividual'),
  () => import('@/pages/EnsaioProctor'),
  () => import('@/pages/EnsaioVigaBenkelman'),
  () => import('@/pages/EnsaioTaxaPinturaImprimacao'),
  () => import('@/pages/EnsaioManchaPendulo'),
  () => import('@/pages/EnsaioMRAF'),
  () => import('@/pages/EnsaioTaxaMRAF'),
  () => import('@/pages/EnsaioRompimentoConcreto'),
  () => import('@/pages/EnsaioSondagem'),
  () => import('@/pages/EnsaioDensidade'),
  () => import('@/pages/BoletimSondagem'),
  () => import('@/pages/BoletimSondagemTrado'),
  () => import('@/pages/GranuMistura'),
  () => import('@/pages/CertificacaoUsina/index'),
  () => import('@/pages/NovaNC'),
  () => import('@/pages/Dashboard'),
  ...REPORT_PAGE_LOADERS,
];

let started = false;

export function prefetchFieldPages() {
  if (started) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  started = true;

  const run = async () => {
    for (const load of FIELD_PAGES) {
      try {
        await load();
      } catch (e) {
        logger.warn('[prefetch] Falha ao pré-baixar tela:', e?.message);
      }
    }
    logger.log('[prefetch] Telas de campo pré-baixadas para uso offline');
  };

  // Aguarda o app assentar antes de baixar em background
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => run(), { timeout: 10000 });
  } else {
    setTimeout(run, 5000);
  }
}