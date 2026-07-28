import React from 'react';
import { useReportMode } from '@/hooks/useReportMode';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import SignatureFooter from '@/components/relatorios/SignatureFooter';
import { useRelatorioBoletimSondagemTradoData } from '@/hooks/useRelatorioBoletimSondagemTradoData';
import { useRelatorioBoletimSondagemTradoActions } from '@/hooks/useRelatorioBoletimSondagemTradoActions';
import BoletimHeader from '@/components/relatorio-boletim-sondagem-trado/BoletimHeader';
import BoletimDadosObra from '@/components/relatorio-boletim-sondagem-trado/BoletimDadosObra';
import BoletimCamadas from '@/components/relatorio-boletim-sondagem-trado/BoletimCamadas';
import BoletimUmidade from '@/components/relatorio-boletim-sondagem-trado/BoletimUmidade';
import BoletimDensidades from '@/components/relatorio-boletim-sondagem-trado/BoletimDensidades';
import BoletimFotos from '@/components/relatorio-boletim-sondagem-trado/BoletimFotos';

export default function RelatorioBoletimSondagemTrado() {
  useReportMode();
  const { boletim, obra, regional, loading, error } =
    useRelatorioBoletimSondagemTradoData();
  const { imprimirPDF } = useRelatorioBoletimSondagemTradoActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !boletim) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">{error || 'Erro ao carregar'}</p>
      </div>
    );
  }

  const camadas = boletim.camadas || [];
  const densidades = boletim.densidades_in_situ?.length > 0
    ? boletim.densidades_in_situ
    : [];

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Boletim de Sondagem a Trado
          </h2>
          <div className="flex items-center gap-2">
            {boletim && (
              <AprovacaoBar
                entityName="BoletimSondagemTrado"
                recordId={boletim.id}
              />
            )}
            <Button
              onClick={imprimirPDF}
              className="bg-slate-800 text-white hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" /> Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="report-content-container">
      <div
        className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-2 print:p-1 flex flex-col"
        style={{ fontSize: '95%', minHeight: 'calc(297mm - 16mm)' }}
      >
        <BoletimHeader regional={regional} />

        <main className="text-xs space-y-2">
          <BoletimDadosObra boletim={boletim} obra={obra} regional={regional} />

          <BoletimCamadas
            camadas={camadas}
            faceClassificacao={boletim.face_classificacao_1}
          />

          <BoletimUmidade boletim={boletim} />

          <BoletimDensidades boletim={boletim} densidades={densidades} />

          {boletim.observacoes && (
            <section className="mb-[50px]">
              <div className="bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider">
                Observações
              </div>
              <div className="border border-[#94a3b8] bg-white p-1 text-[10px] text-[#00233B] min-h-[20px] break-words whitespace-pre-wrap">
                {boletim.observacoes}
              </div>
            </section>
          )}
        </main>

        <footer
          className="mt-auto pt-1"
          style={{ breakInside: 'avoid', breakBefore: 'avoid' }}
        >
          <SignatureFooter
            labName={boletim.laboratorista_name}
            labEmail={boletim.created_by}
            labCreatedDate={boletim.created_date}
            labPosition="Laboratorista"
            approverName={boletim.approver_details?.name}
            approverEmail={boletim.approved_by}
            approverPosition={boletim.approver_details?.position}
            approverCREA={boletim.approver_details?.crea_number}
            approverDate={boletim.approved_date}
            clientName={boletim.client_signature?.engineer_name}
            clientEmail={boletim.client_signature?.signed_by}
            clientPosition={boletim.client_signature?.position}
            clientCREA={boletim.client_signature?.crea_number}
            clientDate={boletim.client_signature?.signed_date}
          />
        </footer>
      </div>

      <BoletimFotos boletim={boletim} obra={obra} regional={regional} />
      </div>

      <style>{`
        table tr { line-height: 1.075; }
        table td, table th { padding-top: 0.22rem; padding-bottom: 0.22rem; }
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}