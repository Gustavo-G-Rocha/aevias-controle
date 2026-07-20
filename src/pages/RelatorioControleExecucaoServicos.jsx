import React, { useState, useEffect, useMemo } from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { obterEnsaioById } from '@/services/ensaiosService';
import { obterObraById } from '@/services/obrasService';
import { obterRegionalById } from '@/services/regionaisService';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import RelatorioControleExecucaoServicos from "@/components/relatorios/RelatorioControleExecucaoServicos";
import { mapControleToPresentation } from "@/utils/relatorioControleExecucaoServicosMapper";
import { logger } from '@/utils/logger';

export default function RelatorioControleExecucaoServicosPage() {
  useReportMode();
  const [registro, setRegistro] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      if (!id) {
        setError("ID do registro não fornecido");
        setLoading(false);
        return;
      }

      const registroData = await obterEnsaioById('ControleExecucaoServicos', id);
      setRegistro(registroData);

      if (registroData.obra_id) {
        const obraData = await obterObraById(registroData.obra_id);
        setObra(obraData);

        if (obraData.regional_id) {
          const regionalData = await obterRegionalById(obraData.regional_id);
          setRegional(regionalData);
        }
      }
    } catch (err) {
      logger.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do controle de execução");
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(
    () => mapControleToPresentation({ registro, obra, regional }),
    [registro, obra, regional]
  );

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
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Controle de Execução de Serviços
          </h2>
          <div className="flex items-center gap-2">
            {registro && <AprovacaoBar entityName="ControleExecucaoServicos" recordId={registro.id} />}
            <Button onClick={handlePrint} className="bg-[#00233B] text-white hover:bg-[#00233B]/90">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-lg my-4 print:my-0 print:shadow-none">
        <RelatorioControleExecucaoServicos data={data} />
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
            size: A4 portrait;
            margin: 8mm 8mm;
            orphans: 0;
            widows: 0;
          }

          /* Uma única página: neutraliza min-h-screen (que estoura a folha)
             e fixa a altura útil da folha A4 para a assinatura ir ao rodapé */
          .min-h-screen {
            min-height: 0 !important;
          }
          [data-report-root] {
            min-height: 272mm !important;
          }

          .max-w-\\[210mm\\], .max-w-\\[210mm\\] * {
            visibility: visible;
          }

          .max-w-\\[210mm\\] {
            width: 100%;
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
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