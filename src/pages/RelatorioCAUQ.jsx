import React, { useState } from 'react';
import { useReportMode } from '@/hooks/useReportMode';
import { Loader2 } from 'lucide-react';
import { calcularGranulometria } from '@/utils/relatorioCAUQUtils';
import { useRelatorioCAUQData }    from '@/hooks/useRelatorioCAUQData';
import { useRelatorioCAUQActions } from '@/hooks/useRelatorioCAUQActions';
import RelatorioCAUQActions  from '@/components/relatorio-cauq/RelatorioCAUQActions';
import RelatorioCAUQHeader   from '@/components/relatorio-cauq/RelatorioCAUQHeader';
import RelatorioCAUQResumo   from '@/components/relatorio-cauq/RelatorioCAUQResumo';
import RelatorioCAUQGraficos from '@/components/relatorio-cauq/RelatorioCAUQGraficos';
import RelatorioCAUQTabelas  from '@/components/relatorio-cauq/RelatorioCAUQTabelas';
import SignatureFooter from '../components/relatorios/SignatureFooter';

export default function RelatorioCAUQ() {
  useReportMode();

  const { ensaio, obra, regional, project, faixa, loading, error } = useRelatorioCAUQData();
  const { handlePrint } = useRelatorioCAUQActions();

  // Estado de UI do tooltip do gráfico — permanece na página por ser estado visual puro
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos,   setTooltipPos]   = useState({ x: 0, y: 0 });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !ensaio) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">{error || 'Erro ao carregar relatório'}</p>
      </div>
    );
  }

  const dadosGranulometria = calcularGranulometria(ensaio, faixa, project);

  return (
    <div className="bg-white min-h-screen">
      <RelatorioCAUQActions ensaio={ensaio} onPrint={handlePrint} />

      <div>
        <div className="w-full max-w-[270mm] mx-auto bg-white shadow-xl print:shadow-none pt-0.5 px-3 pb-0.5 print:pt-0 print:px-0.5 print:pb-0">
          <RelatorioCAUQHeader ensaio={ensaio} regional={regional} />

          <main className="text-sm print:text-sm">
            <RelatorioCAUQResumo
              ensaio={ensaio}
              obra={obra}
              regional={regional}
              project={project}
              faixa={faixa}
            />

            <RelatorioCAUQTabelas
              ensaio={ensaio}
              project={project}
              faixa={faixa}
              dadosGranulometria={dadosGranulometria}
            />

            <RelatorioCAUQGraficos
              dadosGranulometria={dadosGranulometria}
              realizarMarshall={ensaio.realizar_marshall}
              hoveredPoint={hoveredPoint}
              tooltipPos={tooltipPos}
              onPointHover={(point, pos) => { setHoveredPoint(point); setTooltipPos(pos); }}
              onPointLeave={() => setHoveredPoint(null)}
            />
          </main>

          <footer className="px-1.5 print:break-inside-avoid print:break-before-avoid print:px-0.5 mt-2 print:mt-1">
            <SignatureFooter
              labName={ensaio.laboratorista_name}
              labEmail={ensaio.created_by}
              labCreatedDate={ensaio.created_date}
              labPosition="Laboratorista"
              approverName={ensaio.approver_details?.name}
              approverEmail={ensaio.approved_by}
              approverPosition={ensaio.approver_details?.position}
              approverCREA={ensaio.approver_details?.crea_number}
              approverDate={ensaio.approved_date}
              clientName={ensaio.client_signature?.engineer_name}
              clientEmail={ensaio.client_signature?.signed_by}
              clientPosition={ensaio.client_signature?.position}
              clientCREA={ensaio.client_signature?.crea_number}
              clientDate={ensaio.client_signature?.signed_date}
              sizePrint={true}
            />
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0 !important;
            padding: 0 !important;
          }
          header {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: grid !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            margin-top: 0 !important;
          }
          footer {
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          aside, nav, [data-sidebar], [role="navigation"] { display: none !important; }
          ::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        }
      `}</style>
    </div>
  );
}