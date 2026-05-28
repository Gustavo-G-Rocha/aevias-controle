import React from 'react';
import SignatureFooter from './SignatureFooter';
import { ReportSectionTitle } from './shared';
import CondicionamentoInsumos from './checklist-mraf/CondicionamentoInsumos';
import PreparacaoSuperficie from './checklist-mraf/PreparacaoSuperficie';
import AcompanhamentoAplicacao from './checklist-mraf/AcompanhamentoAplicacao';
import MRAFHeader from './checklist-mraf/MRAFHeader';
import MRAFPhotosPage from './checklist-mraf/MRAFPhotosPage';
import MRAFActionsPage from './checklist-mraf/MRAFActionsPage';
import { createPhotoPages, shouldShowActionsPage } from '@/utils/relatorioChecklistMRAFUtils';

const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

const ReportFooter = ({ checklist }) => (
  <SignatureFooter
    labName={checklist.laboratorista_name}
    labEmail={checklist.created_by}
    labCreatedDate={checklist.created_date}
    labPosition="Laboratorista"
    approverName={checklist.approver_details?.name}
    approverEmail={checklist.approved_by}
    approverPosition={checklist.approver_details?.position}
    approverCREA={checklist.approver_details?.crea_number}
    approverDate={checklist.approved_date}
    clientName={checklist.client_signature?.engineer_name}
    clientEmail={checklist.client_signature?.signed_by}
    clientPosition={checklist.client_signature?.position}
    clientCREA={checklist.client_signature?.crea_number}
    clientDate={checklist.client_signature?.signed_date}
  />
);

export default function RelatorioChecklistMRAF({ checklist, obra, regional, project }) {
  const [compressedPhotos, setCompressedPhotos] = React.useState([]);
  const [isCompressing, setIsCompressing] = React.useState(true);

  React.useEffect(() => {
    const compressImages = async () => {
      if (!checklist?.fotos || checklist.fotos.length === 0) {
        setIsCompressing(false);
        return;
      }

      const compressed = await Promise.all(
        checklist.fotos.map(async (photoUrl) => {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = photoUrl;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = width * ratio;
              height = height * ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            return canvas.toDataURL('image/jpeg', 0.5);
          } catch (error) {
            console.error('Erro ao comprimir imagem:', error);
            return photoUrl;
          }
        })
      );

      setCompressedPhotos(compressed);
      setIsCompressing(false);
    };

    compressImages();
  }, [checklist?.fotos]);

  if (isCompressing) {
    return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;
  }

  const photoPages = createPhotoPages(compressedPhotos);

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white print:bg-white" style={{ fontSize: '9px' }}>
      <div className="relative min-h-[297mm] p-4 print:p-4 flex flex-col">
        <MRAFHeader checklist={checklist} obra={obra} regional={regional} project={project} />

        <div className="flex-1 space-y-0.5">
          {/* CONDIÇÕES CLIMÁTICAS */}
          <div className="break-inside-avoid mt-0">
            <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '9px' }}>
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 p-0.5 text-center font-medium">MANHÃ</th>
                  <th className="border border-slate-300 p-0.5 text-center font-medium">TARDE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {checklist.periodos_clima?.map((periodo, index) => (
                    <td key={`clima-${index}`} className="border border-slate-300 p-0.5 text-center">
                      <p className="font-medium">Temp. Ambiente (°C): {periodo.temperatura_ambiente || '-'}</p>
                      <div className="mt-0.5">
                        {periodo.condicoes_climaticas === 'bom' && <p className="font-bold text-slate-800 text-sm">☀️ Bom</p>}
                        {periodo.condicoes_climaticas === 'nublado' && <p className="font-bold text-slate-800 text-sm">⛅ Nublado</p>}
                        {periodo.condicoes_climaticas === 'chuva' && <p className="font-bold text-slate-800 text-sm">🌧️ Chuva</p>}
                        {!periodo.condicoes_climaticas && <p className="text-slate-500">-</p>}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <CondicionamentoInsumos data={checklist.condicionamento_insumos} />

          <PreparacaoSuperficie data={checklist.preparacao_superficie} />

          <AcompanhamentoAplicacao data={checklist.acompanhamento_aplicacao} />

          {/* CONTROLE DE APLICAÇÃO */}
          <div className="break-inside-avoid">
            <SectionTitle>Controle de Aplicação</SectionTitle>
            <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '9px' }}>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-0.5 font-medium bg-slate-50 w-1/4">km/estaca inicial:</td>
                  <td className="border border-slate-300 p-0.5">{checklist.controle_aplicacao?.km_estaca_inicial || '-'}</td>
                  <td className="border border-slate-300 p-0.5 font-medium bg-slate-50 w-1/4">km/estaca final:</td>
                  <td className="border border-slate-300 p-0.5">{checklist.controle_aplicacao?.km_estaca_final || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-0.5 font-medium bg-slate-50">Lado:</td>
                  <td className="border border-slate-300 p-0.5">{checklist.controle_aplicacao?.lado_inicial || '-'}</td>
                  <td className="border border-slate-300 p-0.5 font-medium bg-slate-50">Lado:</td>
                  <td className="border border-slate-300 p-0.5">{checklist.controle_aplicacao?.lado_final || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-0.5 font-medium bg-slate-50" colSpan="2">Quantidade aplicada (m²):</td>
                  <td className="border border-slate-300 p-0.5" colSpan="2">{checklist.controle_aplicacao?.quantidade_aplicada_m2 || '-'}</td>
                </tr>
                {checklist.controle_aplicacao?.observacoes && (
                  <tr>
                    <td className="border border-slate-300 p-0.5 font-medium bg-slate-50">Observações:</td>
                    <td className="border border-slate-300 p-0.5" colSpan="3">{checklist.controle_aplicacao.observacoes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* OBSERVAÇÕES GERAIS */}
          {checklist.observacoes_gerais && (
            <div className="break-inside-avoid">
              <SectionTitle>Observações Gerais</SectionTitle>
              <div className="p-0.5 bg-white border border-slate-300 rounded text-[9px]">
                <p>{checklist.observacoes_gerais}</p>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-2 pt-1 break-inside-avoid">
          <ReportFooter checklist={checklist} />
        </footer>
      </div>

      {shouldShowActionsPage(checklist) && (
        <MRAFActionsPage checklist={checklist} obra={obra} regional={regional} project={project} />
      )}

      {photoPages.map((photos, pageIndex) => (
        <MRAFPhotosPage
          key={pageIndex}
          photos={photos}
          pageIndex={pageIndex}
          regional={regional}
          obra={obra}
        />
      ))}
    </div>
  );
}