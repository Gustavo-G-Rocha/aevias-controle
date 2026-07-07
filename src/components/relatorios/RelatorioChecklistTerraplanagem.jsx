import React, { useState, useEffect } from "react";
import { carregarObraRegional } from "@/services/relatorioContextService";
import SignatureFooter from './SignatureFooter';
import { compressImages } from '@/utils/reportImageCompression';

import HeaderTerra from '@/components/relatorio-checklist-terraplanagem/HeaderTerra';
import DadosObraTerra from '@/components/relatorio-checklist-terraplanagem/DadosObraTerra';
import ClimaTable from '@/components/relatorio-checklist-terraplanagem/ClimaTable';
import AcompanhamentoExecucaoTable from '@/components/relatorio-checklist-terraplanagem/AcompanhamentoExecucaoTable';
import EnsaiosTable from '@/components/relatorio-checklist-terraplanagem/EnsaiosTable';
import SectionTitleTerra from '@/components/relatorio-checklist-terraplanagem/SectionTitleTerra';
import PhotoPages from '@/components/relatorio-checklist-terraplanagem/PhotoPages';
import ActionsPage from '@/components/relatorio-checklist-terraplanagem/ActionsPage';

import { temAcoesCorretivas, buildFooterProps } from '@/utils/relatorioChecklistTerraplanagemUtils';
import { logger } from '@/utils/logger';

export default function RelatorioChecklistTerraplanagem({ checklist, creatorUser, obra: obraProp, regional: regionalProp }) {
  const [obra, setObra] = useState(obraProp || null);
  const [regional, setRegional] = useState(regionalProp || null);
  const [compressedPhotos, setCompressedPhotos] = useState([]);
  const [isCompressing, setIsCompressing] = useState(true);

  useEffect(() => {
    if (!obraProp) loadRelatedData();
  }, [checklist, obraProp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const compressed = await compressImages(checklist?.fotos || []);
        if (!cancelled) {
          setCompressedPhotos(compressed.length ? compressed : (checklist?.fotos || []));
        }
      } catch {
        if (!cancelled) {
          setCompressedPhotos(checklist?.fotos || []);
        }
      } finally {
        if (!cancelled) setIsCompressing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [checklist?.fotos]);

  const loadRelatedData = async () => {
    try {
      if (checklist.obra_id) {
        const { obra: obraData, regional: regionalData } = await carregarObraRegional(checklist.obra_id);
        setObra(obraData);
        setRegional(regionalData);
      }
    } catch (error) {
      logger.error("Erro ao carregar dados relacionados:", error);
    }
  };

  if (isCompressing) {
    return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;
  }

  const temAcoes = temAcoesCorretivas(checklist);
  const temNC = checklist.nao_conformidades && checklist.nao_conformidades.length > 0;
  const footerProps = buildFooterProps(checklist, creatorUser);

  return (
    <div className="bg-white font-sans min-h-screen print:bg-white">
      {/* PÁGINA PRINCIPAL */}
      <div className="print:pt-2 print:pb-3">
        <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none pt-2 px-3 pb-3 print:pt-2 print:px-3 print:pb-3">
          <HeaderTerra regional={regional} checklist={checklist} />

          <main className="text-xs print:text-xs mt-0.5 mb-3">
            <DadosObraTerra regional={regional} obra={obra} checklist={checklist} />
            <ClimaTable periodos_clima={checklist.periodos_clima} />
            <AcompanhamentoExecucaoTable 
              acompanhamento_execucao={checklist.acompanhamento_execucao} 
              observacoes={checklist.acompanhamento_execucao?.observacoes}
            />
            <EnsaiosTable 
              ensaios_empreiteira={checklist.ensaios_empreiteira}
              umidade={{
                otima_quantidade: checklist.umidade_otima_quantidade,
                otima_resultados: checklist.umidade_otima_resultados,
                in_situ_quantidade: checklist.umidade_in_situ_quantidade,
                in_situ_resultados: checklist.umidade_in_situ_resultados,
              }}
              checklist={checklist}
            />

            {checklist.observacoes_gerais && (
              <>
                <SectionTitleTerra>Observações Gerais</SectionTitleTerra>
                <div className="text-xs mb-0.5 p-1 bg-white rounded border border-slate-300 h-16 overflow-hidden">
                  {checklist.observacoes_gerais}
                </div>
              </>
            )}
          </main>

          <SignatureFooter {...footerProps} />
        </div>
      </div>

      {/* PÁGINA DE AÇÕES CORRETIVAS E/OU NÃO CONFORMIDADES */}
      <ActionsPage 
        checklist={checklist}
        regional={regional}
        obra={obra}
        temAcoes={temAcoes}
        temNC={temNC}
        footerProps={footerProps}
      />

      {/* Páginas de Fotos */}
      <PhotoPages photos={compressedPhotos} regional={regional} checklist={checklist} obra={obra} />
    </div>
  );
}