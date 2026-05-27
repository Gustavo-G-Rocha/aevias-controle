import React from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";

import { useRelatorioRompimentoConcretoData } from "@/hooks/useRelatorioRompimentoConcretoData";
import { useRelatorioRompimentoConcretoActions } from "@/hooks/useRelatorioRompimentoConcretoActions";
import { agruparEmSeries } from "@/utils/relatorioRompimentoConcretoUtils";

import RelatorioRompimentoHeader from "@/components/relatorio-rompimento-concreto/RelatorioRompimentoHeader";
import RelatorioRompimentoDadosGerais from "@/components/relatorio-rompimento-concreto/RelatorioRompimentoDadosGerais";
import RelatorioRompimentoDadosEnsaio from "@/components/relatorio-rompimento-concreto/RelatorioRompimentoDadosEnsaio";
import RelatorioRompimentoEnsaios from "@/components/relatorio-rompimento-concreto/RelatorioRompimentoEnsaios";
import RelatorioRompimentoObs from "@/components/relatorio-rompimento-concreto/RelatorioRompimentoObs";
import SignatureFooter from "@/components/relatorios/SignatureFooter";

export default function RelatorioRompimentoConcreto() {
  useReportMode();

  const { ensaio, obra, regional, loading, error } = useRelatorioRompimentoConcretoData();
  const { handlePrint } = useRelatorioRompimentoConcretoActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !ensaio) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error || "Erro ao carregar"}
      </div>
    );
  }

  return (
    <div className="relatorio-page bg-white min-h-screen">
      <RelatorioRompimentoHeader
        ensaio={ensaio}
        regional={regional}
        onPrint={handlePrint}
      />

      <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-2 print:p-1 flex flex-col">
        <RelatorioRompimentoDadosGerais
          ensaio={ensaio}
          obra={obra}
          regional={regional}
        />

        <RelatorioRompimentoDadosEnsaio ensaio={ensaio} />

        <RelatorioRompimentoEnsaios ensaio={ensaio} />

        <RelatorioRompimentoObs ensaio={ensaio} />

        <footer className="mt-auto pt-4">
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
          />
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          .relatorio-page > div:first-child { display: none !important; }
        }
        .relatorio-page table tr td,
        .relatorio-page table tr th {
          height: 22px;
          min-height: 22px;
          overflow: hidden;
          white-space: nowrap;
          text-align: center;
          vertical-align: middle;
        }
        .relatorio-page table tr td:first-child {
          text-align: left;
        }
        @media print {
          .relatorio-page table {
            font-size: 8px !important;
            width: 100% !important;
          }
          .relatorio-page table td,
          .relatorio-page table th {
            padding: 1px 3px !important;
          }
        }
      `}</style>
    </div>
  );
}