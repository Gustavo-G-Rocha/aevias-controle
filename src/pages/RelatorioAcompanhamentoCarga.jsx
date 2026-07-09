import React, { useState, useEffect } from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, FileDown } from "lucide-react";
import { obterEnsaioById } from '@/services/ensaiosService';
import { obterObraById } from '@/services/obrasService';
import { obterRegionalById } from '@/services/regionaisService';
import { obterProjectById } from '@/services/projectsService';
import { obterFaixaById } from '@/services/faixasService';
import AprovacaoBar from '../components/relatorios/AprovacaoBar';
import { generateReportPdf } from '@/services/reportPdfService';

import RelatorioAcompanhamentoCarga from "@/components/relatorios/RelatorioAcompanhamentoCarga";
import { logger } from '@/utils/logger';

export default function RelatorioAcompanhamentoCargaPage() {
  useReportMode();
  const [acompanhamento, setAcompanhamento] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [projeto, setProjeto] = useState(null);
  const [faixaGranulometrica, setFaixaGranulometrica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      if (!id) {
        setError("ID do acompanhamento não fornecido");
        setLoading(false);
        return;
      }

      const acompanhamentoData = await obterEnsaioById('AcompanhamentoCarga', id);
      setAcompanhamento(acompanhamentoData);

      if (acompanhamentoData.obra_id) {
        const obraData = await obterObraById(acompanhamentoData.obra_id);
        setObra(obraData);

        if (obraData.regional_id) {
          const regionalData = await obterRegionalById(obraData.regional_id);
          setRegional(regionalData);
        }
      }

      if (acompanhamentoData.project_id) {
        const projetoData = await obterProjectById(acompanhamentoData.project_id);
        setProjeto(projetoData);

        // Buscar faixa granulométrica pelo ID se existir
        if (projetoData.faixa_granulometrica_id) {
          try {
            const faixaData = await obterFaixaById(projetoData.faixa_granulometrica_id);
            setFaixaGranulometrica(faixaData);
          } catch (err) {
            logger.warn("Faixa granulométrica não encontrada:", err);
          }
        }
      }
    } catch (err) {
      logger.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do acompanhamento");
    } finally {
      setLoading(false);
    }
  };

  const handleGerarPdf = async () => {
    if (!acompanhamento?.id) return;
    setGeneratingPdf(true);
    const result = await generateReportPdf('AcompanhamentoCarga', acompanhamento.id);
    setGeneratingPdf(false);
    if (!result.success) {
      logger.warn('Fallback para window.print() devido a erro:', result.error);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#00233B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[297mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Relatório de Acompanhamento de Cargas
          </h2>
          <div className="flex items-center gap-2">
            {acompanhamento && <AprovacaoBar entityName="AcompanhamentoCarga" recordId={acompanhamento.id} />}
            <Button
              onClick={handleGerarPdf}
              disabled={generatingPdf}
              className="bg-[#00233B] text-white hover:bg-[#00233B]/90"
            >
              {generatingPdf ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              {generatingPdf ? 'Gerando...' : 'Baixar PDF'}
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[297mm] mx-auto bg-white shadow-lg my-4 print:my-0 print:shadow-none">
        <RelatorioAcompanhamentoCarga
          acompanhamento={acompanhamento}
          obra={obra}
          regional={regional}
          projeto={projeto}
          faixaGranulometrica={faixaGranulometrica}
        />
      </div>

      <style>{`
        @media print {
          html, body {
            height: auto;
            margin: 0;
            padding: 0;
            background: white !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          @page {
            size: A4 landscape;
            margin: 6mm 6mm;
            orphans: 0;
            widows: 0;
          }
                    
          .max-w-\\[297mm\\], .max-w-\\[297mm\\] * {
            visibility: visible;
          }
          
          .max-w-\\[297mm\\] {
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
          
          .overflow-x-auto {
            overflow-x: visible !important;
          }
          
          table, thead, tbody, tr, td, th {
            border: 0.5px solid #cbd5e1 !important;
            border-collapse: collapse !important;
          }

          tbody tr:last-child td {
            border-bottom: 0.5px solid #cbd5e1 !important;
          }

          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}