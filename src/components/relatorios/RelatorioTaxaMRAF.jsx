import React from 'react';
import RelatorioTaxaMRAFHeader from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFHeader";
import RelatorioTaxaMRAFDadosObra from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFDadosObra";
import RelatorioTaxaMRAFTabelas from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFTabelas";
import RelatorioTaxaMRAFResumo from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFResumo";
import RelatorioTaxaMRAFObservacoes from "@/components/relatorio-taxa-mraf/RelatorioTaxaMRAFObservacoes";
import SignatureFooter from '@/components/relatorios/SignatureFooter';

export default function RelatorioTaxaMRAF({ ensaio, obra, regional, user }) {
  if (!ensaio) return null;

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full max-w-[210mm] mx-auto bg-white py-4 px-4 print:py-3 print:px-3">
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
            labPosition={user?.position || 'Laboratorista'}
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