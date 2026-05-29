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

export default function RelatorioChecklistAplicacao({ checklist, obra, regional, user, creatorUser }) {
  const [compressedPhotos, setCompressedPhotos] = React.useState([]);
  const [compressedMedicoes, setCompressedMedicoes] = React.useState([]);
  const [isCompressing, setIsCompressing] = React.useState(true);

  React.useEffect(() => {
    const compressImages = async () => {
      const hasFotos = checklist?.fotos && checklist.fotos.length > 0;
      const hasMedicoes = checklist?.medicoes_geometricas && checklist.medicoes_geometricas.length > 0;

      if (!hasFotos && !hasMedicoes) { setIsCompressing(false); return; }

      const compressImage = async (photoUrl, isHighQuality = false) => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = photoUrl; });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = isHighQuality ? 1200 : 800;
          const maxHeight = isHighQuality ? 900 : 600;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio; height = height * ratio;
          }

          canvas.width = width; canvas.height = height;
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', isHighQuality ? 0.85 : 0.6);
        } catch (error) {
          console.error('Erro ao comprimir imagem:', error);
          return photoUrl;
        }
      };

      if (hasFotos) {
        const compressed = await Promise.all(
          checklist.fotos.filter(p => p && p.trim() !== '').map(url => compressImage(url, false))
        );
        setCompressedPhotos(compressed);
      }

      if (hasMedicoes) {
        const compressed = await Promise.all(
          checklist.medicoes_geometricas.filter(m => m && m.trim() !== '').map(url => compressImage(url, true))
        );
        setCompressedMedicoes(compressed);
      }

      setIsCompressing(false);
    };

    compressImages();
  }, [checklist?.fotos, checklist?.medicoes_geometricas]);

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