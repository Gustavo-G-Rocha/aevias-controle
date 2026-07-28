import React from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";
import { useRelatorioTaxaMRAFData } from "@/hooks/useRelatorioTaxaMRAFData";
import { useRelatorioTaxaMRAFActions } from "@/hooks/useRelatorioTaxaMRAFActions";
import RelatorioTaxaMRAFActions from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFActions";
import RelatorioTaxaMRAFHeader from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFHeader";
import RelatorioTaxaMRAFDadosObra from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFDadosObra";
import RelatorioTaxaMRAFTabelas from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFTabelas";
import RelatorioTaxaMRAFResumo from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFResumo";
import RelatorioTaxaMRAFObservacoes from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFObservacoes";
import SignatureFooter from '@/components/relatorios/SignatureFooter';


export default function RelatorioTaxaMRAF() {
  useReportMode();
  
  const params = new URLSearchParams(window.location.search);
  const ensaioId = params.get('id');
  
  const { ensaio, obra, regional, creatorUser, loading } = useRelatorioTaxaMRAFData(ensaioId);
  const { handlePrint } = useRelatorioTaxaMRAFActions();

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!ensaio) return <div className="p-8 text-center text-red-600">Ensaio não encontrado.</div>;

  return (
    <div className="bg-white min-h-screen">
      <RelatorioTaxaMRAFActions ensaio={ensaio} onPrint={handlePrint} />

      <style>{`
        @media print {
          html, body {
            height: auto;
            margin: 0;
            padding: 0;
            background: white !important;
            color-adjust: exact !important;
            border: 0.5px solid #cbd5e1 !important;
            -webkit-print-color-adjust: exact !important;
          }
          @page { 
            size: A4 portrait;
            margin: 10mm 12mm;
            orphans: 0;
            widows: 0;
          }
          .max-w-\\[210mm\\] {
            width: 100%;
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            page-break-inside: avoid !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
            page-break-inside: avoid !important;
          }
          table, thead, tbody, tr, td, th {
            border: 0.5px solid #cbd5e1 !important;
            border-collapse: collapse !important;
          }
          tbody tr:last-child td {
            border-bottom: 0.5px solid #cbd5e1 !important;
          }
          .print\\:hidden { display: none !important; visibility: hidden !important; }
        }
      `}</style>

      <div className="report-content-container w-full max-w-[210mm] mx-auto bg-white py-4 px-4 print:py-3 print:px-3">
        <RelatorioTaxaMRAFHeader ensaio={ensaio} regional={regional} />
        <RelatorioTaxaMRAFDadosObra ensaio={ensaio} obra={obra} regional={regional} />
        <RelatorioTaxaMRAFTabelas ensaio={ensaio} />
        <RelatorioTaxaMRAFResumo ensaio={ensaio} />
        <RelatorioTaxaMRAFObservacoes ensaio={ensaio} />

        <footer className="pt-2">
          <SignatureFooter
            labName={ensaio.laboratorista_name}
            labEmail={ensaio.created_by}
            labCreatedDate={ensaio.created_date}
            labPosition={creatorUser?.position || 'Laboratorista'}
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
          />
        </footer>
      </div>
    </div>
  );
}