import React, { createContext, useContext, useMemo } from 'react';
import { mapAcompanhamentoToPresentation } from '@/utils/relatorioAcompanhamentoCargaMapper';

const RelatorioAcompanhamentoCargaContext = createContext(null);

/**
 * Hook consumidor do contexto do relatório de Acompanhamento de Carga.
 * Lança erro se usado fora do Provider, falhando cedo em desenvolvimento.
 *
 * @returns {{ data: object|null }} Presentation model pronto para exibição
 */
export function useRelatorioAcompanhamentoCargaCtx() {
  const ctx = useContext(RelatorioAcompanhamentoCargaContext);
  if (!ctx) {
    throw new Error(
      'useRelatorioAcompanhamentoCargaCtx deve ser usado dentro de <RelatorioAcompanhamentoCargaProvider>'
    );
  }
  return ctx;
}

/**
 * Provider que recebe as entidades brutas (acompanhamento, obra, regional,
 * projeto, faixaGranulometrica) e deriva o Presentation Model via mapper.
 *
 * Componentes filhos consomem via useRelatorioAcompanhamentoCargaCtx() —
 * sem prop drilling através da árvore de componentes de relatório.
 */
export function RelatorioAcompanhamentoCargaProvider({
  acompanhamento,
  obra,
  regional,
  projeto,
  faixaGranulometrica,
  children,
}) {
  const data = useMemo(
    () =>
      mapAcompanhamentoToPresentation({
        acompanhamento,
        obra,
        regional,
        projeto,
        faixaGranulometrica,
      }),
    [acompanhamento, obra, regional, projeto, faixaGranulometrica]
  );

  return (
    <RelatorioAcompanhamentoCargaContext.Provider value={{ data }}>
      {children}
    </RelatorioAcompanhamentoCargaContext.Provider>
  );
}