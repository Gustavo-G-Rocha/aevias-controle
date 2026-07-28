import React from 'react';
import { Loader2 } from "lucide-react";
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import { useRelatorioDensidadeInSituData } from "@/hooks/useRelatorioDensidadeInSituData";
import { useRelatorioDensidadeInSituActions } from "@/hooks/useRelatorioDensidadeInSituActions";
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';

import RelatorioDensidadeInSituHeader from "@/components/relatorio-densidade-insitu/RelatorioDensidadeInSituHeader";
import RelatorioDensidadeInSituDadosObra from "@/components/relatorio-densidade-insitu/RelatorioDensidadeInSituDadosObra";
import RelatorioDensidadeInSituTabela from "@/components/relatorio-densidade-insitu/RelatorioDensidadeInSituTabela";
import RelatorioDensidadeInSituObservacoes from "@/components/relatorio-densidade-insitu/RelatorioDensidadeInSituObservacoes";
import SignatureFooter from '@/components/relatorios/SignatureFooter';

export default function RelatorioDensidadeInSituPage() {
  useReportMode();
  const { ensaio, obra, regional, loading, error } = useRelatorioDensidadeInSituData();
  const { handlePrint } = useRelatorioDensidadeInSituActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-slate-700">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Erro: {error}</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Relatório de Densidade In Situ
          </h2>
          <div className="flex items-center gap-2">
            {ensaio && <AprovacaoBar entityName="EnsaioDensidadeInSitu" recordId={ensaio.id} />}
            <Button onClick={handlePrint} className="bg-slate-800 text-white hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>
      
      <div className="report-content-container w-full bg-white print:bg-white">
        {ensaio && (
          <div className="bg-white font-sans">
            <div className="w-full max-w-[210mm] mx-auto bg-white p-6 print:p-6 print:min-h-[297mm]" style={{ minHeight: '100vh' }}>
              <RelatorioDensidadeInSituHeader regional={regional} />
              <RelatorioDensidadeInSituDadosObra ensaio={ensaio} obra={obra} regional={regional} />
              <RelatorioDensidadeInSituTabela ensaio={ensaio} />

              <footer className="mt-4 pt-3 print:break-inside-avoid">
                <RelatorioDensidadeInSituObservacoes ensaio={ensaio} />
                <div className="px-4">
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
                </div>
              </footer>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media screen {
          .report-content-container {
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }
        
        @media print {
          * { box-sizing: border-box; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .no-print, 
          .no-print * { 
            display: none !important; 
            visibility: hidden !important;
          }
          
          .report-content-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          
          .break-before-page { page-break-before: always; break-before: page; }
          .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}