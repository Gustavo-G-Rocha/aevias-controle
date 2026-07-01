import React from 'react';
import SignatureFooter from './SignatureFooter';

import HeaderAplicacao from '@/components/relatorio-checklist-aplicacao/HeaderAplicacao';
import ClimaTableAplicacao from '@/components/relatorio-checklist-aplicacao/ClimaTableAplicacao';
import FresagemTable from '@/components/relatorio-checklist-aplicacao/FresagemTable';
import PinturaLigacaoTable from '@/components/relatorio-checklist-aplicacao/PinturaLigacaoTable';
import ControleAplicacaoSection from '@/components/relatorio-checklist-aplicacao/ControleAplicacaoSection';
import PhotoPagesAplicacao from '@/components/relatorio-checklist-aplicacao/PhotoPagesAplicacao';
import MedicoesGeometricasPage from '@/components/relatorio-checklist-aplicacao/MedicoesGeometricasPage';
import ActionsPageAplicacao from '@/components/relatorio-checklist-aplicacao/ActionsPageAplicacao';

import { temAcoesCorretivas, buildFooterPropsAplicacao } from '@/utils/relatorioChecklistAplicacaoUtils';
import { compressImages } from '@/utils/reportImageCompression';

export default function RelatorioChecklistAplicacao({ checklist, obra, regional, user, creatorUser }) {
  const [compressedPhotos, setCompressedPhotos] = React.useState([]);
  const [compressedMedicoes, setCompressedMedicoes] = React.useState([]);
  const [isCompressing, setIsCompressing] = React.useState(true);

  React.useEffect(() => {
    const run = async () => {
      const hasFotos = checklist?.fotos && checklist.fotos.length > 0;
      const medicoesFotos = Array.isArray(checklist?.medicoes_geometricas) ? checklist.medicoes_geometricas : [];
      const hasMedicoes = medicoesFotos.length > 0;

      if (!hasFotos && !hasMedicoes) { setIsCompressing(false); return; }

      if (hasFotos) {
        const compressed = await compressImages(checklist.fotos, { maxWidth: 800, maxHeight: 600, quality: 0.6, whiteBg: true });
        setCompressedPhotos(compressed);
      }

      if (hasMedicoes) {
        const compressed = await compressImages(medicoesFotos, { maxWidth: 1200, maxHeight: 900, quality: 0.85, whiteBg: true });
        setCompressedMedicoes(compressed);
      }

      setIsCompressing(false);
    };

    run();
  }, [checklist?.fotos, checklist?.medicoes_geometricas, checklist?.medicoes_geometricas?.length]);

  if (!checklist) return <div className="p-8">Dados do checklist não encontrados.</div>;
  if (isCompressing) return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;

  const temAcoes = temAcoesCorretivas(checklist);
  const footerProps = buildFooterPropsAplicacao(checklist, creatorUser);

  return (
    <div className="bg-white font-sans">
      {/* PÁGINA PRINCIPAL */}
      <div className="p-3 print:p-3 flex flex-col" style={{ minHeight: '297mm', maxHeight: '297mm' }}>
        <div className="w-full max-w-[190mm] mx-auto flex flex-col" style={{ height: '100%' }}>
          <HeaderAplicacao checklist={checklist} obra={obra} regional={regional} />
          <main className="flex-shrink">
            <ClimaTableAplicacao periodos_clima={checklist.periodos_clima} />
            <FresagemTable fresagem_preparacao={checklist.fresagem_preparacao} />
            <PinturaLigacaoTable pintura_ligacao={checklist.pintura_ligacao} />
            <ControleAplicacaoSection
              controle_aplicacao={checklist.controle_aplicacao}
              observacoes_gerais={checklist.observacoes_gerais}
            />
          </main>
          <div className="mt-auto pt-1 break-inside-avoid">
            <SignatureFooter {...footerProps} />
          </div>
        </div>
      </div>

      {/* PÁGINA DE AÇÕES CORRETIVAS E/OU NÃO CONFORMIDADES */}
      <ActionsPageAplicacao
        checklist={checklist}
        obra={obra}
        regional={regional}
        temAcoes={temAcoes}
        footerProps={footerProps}
      />

      {/* PÁGINAS DE FOTOS */}
      <PhotoPagesAplicacao
        photos={compressedPhotos}
        regional={regional}
        checklist={checklist}
        obra={obra}
      />

      {/* PÁGINA DE MEDIÇÕES GEOMÉTRICAS */}
      <MedicoesGeometricasPage
        checklist={checklist}
        regional={regional}
        footerProps={footerProps}
      />
    </div>
  );
}