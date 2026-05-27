import React from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import AprovacaoBar from '../components/relatorios/AprovacaoBar';
import SignatureFooter from '../components/relatorios/SignatureFooter';
import RelatorioSondagemHeader from "@/components/relatorio-sondagem/RelatorioSondagemHeader";
import RelatorioSondagemDadosObra from "@/components/relatorio-sondagem/RelatorioSondagemDadosObra";
import RelatorioSondagemTabela from "@/components/relatorio-sondagem/RelatorioSondagemTabela";
import RelatorioSondagemGrafico from "@/components/relatorio-sondagem/RelatorioSondagemGrafico";
import RelatorioSondagemTabelaContinuacao from "@/components/relatorio-sondagem/RelatorioSondagemTabelaContinuacao";
import { useRelatorioSondagemData } from "@/hooks/useRelatorioSondagemData";
import { useRelatorioSondagemActions } from "@/hooks/useRelatorioSondagemActions";
import { extrairCpsValidos, prepararDadosGrafico, formatDate } from "@/utils/relatorioSondagemUtils";

export default function RelatorioSondagem() {
  useReportMode();
  const { ensaio, obra, regional, project, loading, error } = useRelatorioSondagemData();
  const { handlePrint } = useRelatorioSondagemActions();

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
        <p className="text-red-600">{error || "Erro ao carregar relatório"}</p>
      </div>
    );
  }

  const cpsValidos = extrairCpsValidos(ensaio.corpos_prova);
  const dadosGrafico = prepararDadosGrafico(ensaio, cpsValidos);

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[297mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Relatório de Ensaio de Sondagem
          </h2>
          <div className="flex items-center gap-2">
            {ensaio && <AprovacaoBar entityName="EnsaioSondagem" recordId={ensaio.id} />}
            <Button onClick={handlePrint} className="bg-slate-800 text-white hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="print:pt-0 print:pb-0">
        <div className="w-full max-w-[297mm] mx-auto bg-white shadow-xl print:shadow-none pt-2 px-4 pb-2 print:pt-0 print:px-1 print:pb-2">
          <RelatorioSondagemHeader regional={regional} ensaio={ensaio} />

          <main className="text-xs print:text-xs">
            <RelatorioSondagemDadosObra ensaio={ensaio} obra={obra} regional={regional} project={project} />
            <RelatorioSondagemTabela cpsValidos={cpsValidos} ensaio={ensaio} slice={[0, 10]} />
            <RelatorioSondagemGrafico dados={dadosGrafico} />

            {/* Observações */}
            {ensaio.observacoes && (
              <div className="mb-2">
                <div className="bg-slate-200 px-2 py-0.5 font-bold text-[10px]">OBSERVAÇÕES</div>
                <div className="border border-slate-300 p-0.5 text-[10px] min-h-[20px]">
                  {ensaio.observacoes}
                </div>
              </div>
            )}
            </main>

            {/* Footer com assinaturas */}
            <footer className="mt-3 px-4 print:break-inside-avoid">
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

      {/* Páginas adicionais para mais de 10 CPs */}
      {cpsValidos.length > 10 && (
        <div className="break-before-page print:pt-2 print:pb-3">
          <div className="w-full max-w-[297mm] mx-auto bg-white shadow-xl print:shadow-none pt-2 px-3 pb-3">
            <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-2">
              <div className="flex justify-start">
                <picture><source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} /><img src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" /></picture>
              </div>
              <div className="text-center">
                <h1 className="text-base font-bold text-gray-800">Ensaio de Sondagem - Continuação</h1>
              </div>
              <div className="flex justify-end">
                <div className="border border-gray-400 p-1 rounded-md text-sm print:text-xs bg-white">
                  <p className="font-semibold text-gray-800">{formatDate(ensaio.data)}</p>
                </div>
              </div>
            </header>

            <RelatorioSondagemTabelaContinuacao cpsValidos={cpsValidos} ensaio={ensaio} />
            </div>
            </div>
            )}

      {/* Estilos para impressão */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 8mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .break-before-page {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}