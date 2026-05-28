import React from "react";
import SignatureFooter from './SignatureFooter';
import { ReportSectionTitle, ReportNaoConformidadesTable } from './shared';
import { compressImages, chunkArray } from '@/utils/reportImageCompression';
import { formatDateRecic } from '@/utils/relatorioChecklistReciclagemUtils';
import ReciclagemClimaTable from '@/components/relatorio-checklist-reciclagem/ReciclagemClimaTable';
import ReciclagemAcompanhamentoExecucao from '@/components/relatorio-checklist-reciclagem/ReciclagemAcompanhamentoExecucao';
import ReciclagemEnsaiosEmpreiteira from '@/components/relatorio-checklist-reciclagem/ReciclagemEnsaiosEmpreiteira';

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

const SectionTitle = ({ children }) => <ReportSectionTitle size="sm">{children}</ReportSectionTitle>;

// ── Cabeçalho reutilizável ──────────────────────────────────────────────────
const ReportPrintHeader = ({ checklist, obra, regional, project }) => (
  <div>
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-0.5 mb-0.5">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
          <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo Regional" className="h-12 object-contain" width="48" height="48" />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800">CHECKLIST DE RECICLAGEM</h1>
      </div>
      <div className="flex justify-end">
        <div className="border border-gray-400 p-0.5 rounded-md text-xs bg-white">
          <p className="font-semibold text-gray-800">{formatDateRecic(checklist.data)}</p>
        </div>
      </div>
    </header>

    <SectionTitle>DADOS DA OBRA</SectionTitle>
    <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 mb-2 text-[11px] p-1">
      <div><p className="font-bold text-gray-700">CLIENTE:</p><p className="text-gray-900">{regional?.cliente || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">PROJETO:</p><p className="text-gray-900">{project?.name || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">MATERIAL:</p><p className="text-gray-900">{checklist.material || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">ENSAIO REALIZADO POR:</p><p className="text-gray-900">{checklist.ensaio_realizado_por || 'N/A'}</p></div>

      <div><p className="font-bold text-gray-700">OBRA:</p><p className="text-gray-900">{obra?.name || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">ESTACA:</p><p className="text-gray-900">{checklist.estaca || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">FAIXA:</p><p className="text-gray-900">{checklist.faixa || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">INSPETOR DE CAMPO:</p><p className="text-gray-900">{checklist.inspetor_fiscal || 'N/A'}</p></div>

      <div><p className="font-bold text-gray-700">RODOVIA:</p><p className="text-gray-900">{checklist.rodovia || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">TRECHO:</p><p className="text-gray-900">{checklist.trecho || 'N/A'}</p></div>
      <div><p className="font-bold text-gray-700">EMPREITEIRA:</p><p className="text-gray-900">{checklist.empreiteira || 'N/A'}</p></div>
      <div>
        <p className="font-bold text-gray-700">JORNADA:</p>
        <p className="text-gray-900">
          {checklist.jornada?.horario_inicio && checklist.jornada?.horario_fim
            ? `${checklist.jornada.horario_inicio} - ${checklist.jornada.horario_fim}`
            : 'N/A'}
        </p>
      </div>
    </div>
  </div>
);

// ── Rodapé com assinaturas ──────────────────────────────────────────────────
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

// ── Cabeçalho das páginas de fotos ─────────────────────────────────────────
const PhotoPageHeader = ({ obra, regional, data }) => (
  <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-4 mt-2">
    <div className="flex justify-start">
      <picture>
        <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
        <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo Regional" className="h-12 object-contain" width="48" height="48" />
      </picture>
    </div>
    <div className="text-center">
      <h1 className="text-base font-bold text-gray-800">Relatório Fotográfico</h1>
      <p className="text-xs text-gray-600">Reciclagem</p>
      <p className="text-xs text-gray-600">Obra: {obra?.name || 'N/A'}</p>
    </div>
    <div className="flex justify-end">
      <div className="border border-gray-400 p-1 rounded-md text-sm bg-white">
        <p className="font-semibold text-gray-800">{data ? new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</p>
      </div>
    </div>
  </header>
);

// ── Componente principal ────────────────────────────────────────────────────
export default function RelatorioChecklistReciclagem({ checklist, obra, regional, project }) {
  const [compressedPhotos, setCompressedPhotos] = React.useState([]);
  const [isCompressing, setIsCompressing] = React.useState(true);

  React.useEffect(() => {
    compressImages(checklist?.fotos, { maxWidth: 600, maxHeight: 450, quality: 0.6, whiteBg: true })
      .then(result => {
        setCompressedPhotos(result);
        setIsCompressing(false);
      });
  }, [checklist?.fotos]);

  if (isCompressing) {
    return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;
  }

  const photoChunks = chunkArray(compressedPhotos, 6);
  const temAcoesCorretivas = checklist.acoes_corretivas_realizado === true && checklist.acoes_corretivas_descricao;

  return (
    <>
      {/* Página Principal */}
      <div className={(photoChunks.length > 0 || temAcoesCorretivas) ? "break-after-page" : ""}>
        <ReportPrintHeader checklist={checklist} obra={obra} regional={regional} project={project} />

        <ReciclagemClimaTable periodos={checklist.periodos_clima} />

        <ReciclagemAcompanhamentoExecucao data={checklist.acompanhamento_execucao} />

        <ReciclagemEnsaiosEmpreiteira data={checklist.ensaios_empreiteira} />

        {checklist.observacoes_gerais && (
          <>
            <SectionTitle>OBSERVAÇÕES GERAIS</SectionTitle>
            <div className="border border-slate-300 p-2 min-h-[25px] text-[9px] mb-1">
              {checklist.observacoes_gerais}
            </div>
          </>
        )}

        <ReportFooter checklist={checklist} />
      </div>

      {/* Página de Ações Corretivas / Não Conformidades */}
      {(temAcoesCorretivas || (checklist.nao_conformidades && checklist.nao_conformidades.length > 0)) && (
        <div className="break-before-page">
          <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none py-2 px-3 print:py-2 print:px-3">
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '270mm' }}>
              <ReportPrintHeader checklist={checklist} obra={obra} regional={regional} project={project} />

              <main className="mt-2" style={{ flex: '1' }}>
                {temAcoesCorretivas && (
                  <>
                    <SectionTitle>Ações Corretivas</SectionTitle>
                    <div className="border-2 border-slate-400 rounded p-6 bg-white" style={{ minHeight: '450px' }}>
                      <p className="font-bold text-base mb-4 text-slate-800">AÇÕES CORRETIVAS APONTADAS:</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {checklist.acoes_corretivas_descricao}
                      </p>
                    </div>
                  </>
                )}

                {checklist.nao_conformidades && checklist.nao_conformidades.length > 0 && (
                  <div className="mt-4">
                    <SectionTitle>Não Conformidades</SectionTitle>
                    <ReportNaoConformidadesTable naoConformidades={checklist.nao_conformidades} />
                  </div>
                )}
              </main>

              <div style={{ marginTop: 'auto' }}>
                <ReportFooter checklist={checklist} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Páginas de Fotos */}
      {photoChunks.map((chunk, pageIndex) => (
        <div key={pageIndex} className={pageIndex < photoChunks.length - 1 ? "break-after-page" : ""}>
          <PhotoPageHeader obra={obra} regional={regional} data={checklist.data} />

          <main className="grid grid-cols-2 gap-3 my-4">
            {chunk.map((fotoUrl, fotoIndex) => (
              <div key={fotoIndex} className="border border-slate-300 p-1.5 rounded break-inside-avoid flex flex-col">
                <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                  <picture>
                    <source srcSet={fotoUrl} />
                    <img src={fotoUrl} alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`} className="w-full h-auto object-contain" style={{ maxHeight: '280px' }} width="auto" height="auto" loading="lazy" />
                  </picture>
                </div>
                <p className="text-center text-sm mt-1 font-semibold">
                  Foto {(pageIndex * 6) + fotoIndex + 1}
                </p>
              </div>
            ))}
          </main>
        </div>
      ))}
    </>
  );
}