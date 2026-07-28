import React from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";

import { useRelatorioBoletimSondagemData } from "@/hooks/useRelatorioBoletimSondagemData";
import { useRelatorioBoletimSondagemActions } from "@/hooks/useRelatorioBoletimSondagemActions";
import { temSegundaClassificacao } from "@/utils/relatorioBoletimSondagemUtils";

import BoletimSondagemToolbar from "@/components/relatorio-boletim-sondagem/BoletimSondagemToolbar";
import BoletimSondagemHeader from "@/components/relatorio-boletim-sondagem/BoletimSondagemHeader";
import BoletimSondagemDadosObra from "@/components/relatorio-boletim-sondagem/BoletimSondagemDadosObra";
import BoletimSondagemCamadas from "@/components/relatorio-boletim-sondagem/BoletimSondagemCamadas";
import BoletimSondagemUmidade from "@/components/relatorio-boletim-sondagem/BoletimSondagemUmidade";
import BoletimSondagemDensidade from "@/components/relatorio-boletim-sondagem/BoletimSondagemDensidade";
import BoletimSondagemFotos from "@/components/relatorio-boletim-sondagem/BoletimSondagemFotos";
import SignatureFooter from "@/components/relatorios/SignatureFooter";

export default function RelatorioBoletimSondagem() {
  useReportMode();

  const { boletim, obra, regional, loading, error } = useRelatorioBoletimSondagemData();
  const { handlePrint } = useRelatorioBoletimSondagemActions();

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
        <p className="text-red-600">{error || "Erro ao carregar"}</p>
      </div>
    );
  }

  const temCol2 = temSegundaClassificacao(boletim.camadas);
  const totalPaginas = 1 + Math.ceil((boletim.fotos?.length || 0) / 6);

  return (
    <div className="relatorio-page bg-white min-h-screen">
      <BoletimSondagemToolbar boletim={boletim} onPrint={handlePrint} />

      <div className="report-content-container">
      <div
        className="w-full max-w-[190mm] mx-auto bg-white shadow-xl print:shadow-none p-8 print:p-8 flex flex-col"
        style={{ fontSize: "95%", minHeight: "calc(297mm - 16mm)" }}
      >
        <BoletimSondagemHeader regional={regional} />

        <main className="text-xs space-y-2">
          <BoletimSondagemDadosObra boletim={boletim} obra={obra} regional={regional} />
          <BoletimSondagemCamadas boletim={boletim} temCol2={temCol2} />
          <BoletimSondagemUmidade boletim={boletim} />
          <BoletimSondagemDensidade boletim={boletim} />

          {boletim.observacoes && (
            <section className="mb-[50px]">
              <div className="bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider">Observações</div>
              <div className="border border-[#94a3b8] bg-white p-1 text-[10px] text-[#00233B] min-h-[20px] break-words whitespace-pre-wrap">
                {boletim.observacoes}
              </div>
            </section>
          )}
        </main>

        <footer className="mt-auto pt-1" style={{ breakInside: "avoid", breakBefore: "avoid" }}>
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
          {totalPaginas > 1 && (
            <p className="text-center text-xs text-gray-500 pt-2">
              Página 1 de {totalPaginas}
            </p>
          )}
        </footer>
      </div>

      <BoletimSondagemFotos boletim={boletim} obra={obra} regional={regional} />
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