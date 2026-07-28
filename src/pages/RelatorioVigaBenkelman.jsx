import React from 'react';
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import AprovacaoBar from '../components/relatorios/AprovacaoBar';
import SignatureFooter from '../components/relatorios/SignatureFooter';

import { useRelatorioVigaBenkelmanData } from '@/hooks/useRelatorioVigaBenkelmanData';
import { useRelatorioVigaBenkelmanActions } from '@/hooks/useRelatorioVigaBenkelmanActions';
import { agruparLevantamentosPorFaixa, prepararChartData } from '@/utils/relatorioVigaBenkelmanUtils';

import RelatorioVigaBenkelmanHeader from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanHeader';
import RelatorioVigaBenkelmanDadosObra from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanDadosObra';
import RelatorioVigaBenkelmanTabela from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanTabela';
import RelatorioVigaBenkelmanGrafico from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanGrafico';

export default function RelatorioVigaBenkelman() {
  useReportMode();
  
  const { ensaio, obra, regional, loading, error } = useRelatorioVigaBenkelmanData();
  const { handlePrint } = useRelatorioVigaBenkelmanActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !ensaio) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-slate-700">{error || 'Ensaio não encontrado.'}</p>
      </div>
    );
  }

  const faixasArray = agruparLevantamentosPorFaixa(ensaio.levantamentos);

  return (
    <div className="bg-white min-h-screen">
      <style>{`
        @media print {
          html, body { height: auto; margin: 0; padding: 0; background: white !important; color-adjust: exact !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
          @page { size: A4 portrait; margin: 10mm 12mm; orphans: 0; widows: 0; }
          svg { display: block !important; visibility: visible !important; page-break-inside: avoid !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
          div[class*="p-3"] svg { max-width: 100% !important; height: auto !important; }
          .max-w-\\[210mm\\] { width: 100%; max-width: 100% !important; margin: 0 !important; box-shadow: none !important; background: white !important; page-break-inside: avoid !important; }
          table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; page-break-inside: avoid !important; }
          table, thead, tbody, tr, td, th { border: 0.5px solid #1e293b !important; border-collapse: collapse !important; }
          tbody tr:last-child td { border-bottom: 0.5px solid #1e293b !important; }
          .print\\:hidden { display: none !important; visibility: hidden !important; }
        }
      `}</style>

      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Relatório de Levantamento Deflectométrico por Viga Benkelman
          </h2>
          <div className="flex items-center gap-2">
            {ensaio && <AprovacaoBar entityName="EnsaioVigaBenkelman" recordId={ensaio.id} />}
            <Button onClick={handlePrint} className="bg-slate-800 text-white hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div id="report-content" className="report-content-container w-full max-w-[210mm] mx-auto bg-white p-1 print:p-1">
        {faixasArray.map((faixa, faixaIdx) => {
          const chartData = prepararChartData(faixa.levantamentos, ensaio.def_admissivel);

          return (
            <div key={`faixa-${faixaIdx}`} className={faixaIdx > 0 ? "print:break-before-page" : ""}>
              <RelatorioVigaBenkelmanHeader ensaio={ensaio} regional={regional} faixaNome={faixa.nome} />
              <div className="mb-0">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-1.5 py-0 font-bold text-center mb-0 text-[10px]">
                  DADOS DO ENSAIO
                </div>
              </div>
              <RelatorioVigaBenkelmanDadosObra ensaio={ensaio} obra={obra} regional={regional} faixaNome={faixa.nome} />
              <RelatorioVigaBenkelmanTabela faixa={faixa} ensaio={ensaio} />
              <RelatorioVigaBenkelmanGrafico chartData={chartData} />

              {ensaio.observacoes && (
                <div className="mb-0 print:break-inside-avoid">
                  <div className="bg-slate-200 px-1.5 py-0 font-bold text-[8px]">OBSERVAÇÕES</div>
                  <div className="p-0.5 text-[8px] min-h-[15px] border" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px' }}>
                    <div className="whitespace-pre-wrap">{ensaio.observacoes}</div>
                  </div>
                </div>
              )}

              <footer className="mt-2 pt-2">
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
          );
        })}
      </div>
    </div>
  );
}