import React from 'react';
import { useReportMode } from '@/hooks/useReportMode';
import { Loader2 } from 'lucide-react';
import PdfRenderer from '@/components/relatorios/PdfRenderer';
import { useRelatorioNCData } from '@/hooks/useRelatorioNCData';
import { useRelatorioNCActions } from '@/hooks/useRelatorioNCActions';
import NCReport from '@/components/relatorio-nc/NCReport';
import VinculadoReport from '@/components/relatorio-nc/VinculadoReport';
import FotosSection from '@/components/relatorio-nc/FotosSection';
import ToolbarHeader from '@/components/relatorio-nc/ToolbarHeader';

export default function RelatorioNCPage() {
  useReportMode();
  const { loading, error, data } = useRelatorioNCData();
  const { compressedFotos, compressingFotos, comprimirFotos, imprimirPDF } =
    useRelatorioNCActions(data?.nc?.fotos || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Erro: {error}</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <ToolbarHeader nc={data.nc} onPrint={imprimirPDF} />

      <div className="report-content-container w-full bg-white print:bg-white">
        <NCReport
          nc={data.nc}
          obra={data.obra}
          regional={data.regional}
        />

        {data.registroVinculado && (
          <div className="break-before-page">
            <VinculadoReport
              tipo={data.nc.checklist_ref_tipo}
              registro={data.registroVinculado}
              obra={data.obra}
              regional={data.regional}
              project={data.project}
              creatorUser={data.creatorUser}
              user={data.user}
            />
          </div>
        )}

        <FotosSection
          nc={data.nc}
          regional={data.regional}
          compressedFotos={compressedFotos}
          compressingFotos={compressingFotos}
          onComprimir={comprimirFotos}
        />

        {data.nc.pdfs?.map((pdf, i) => (
          <div key={i} className="break-before-page bg-white">
            <PdfRenderer url={pdf.url} />
          </div>
        ))}
      </div>

      <style>{`
        @media screen {
          .report-content-container {
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
        }
        @media print {
          * { box-sizing: border-box; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            height: auto !important; overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact; color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .report-content-container {
            width: 100% !important; max-width: none !important;
            margin: 0 !important; padding: 0 !important;
            box-shadow: none !important; border: none !important;
            background: white !important;
          }
          .break-before-page { page-break-before: always; break-before: page; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}