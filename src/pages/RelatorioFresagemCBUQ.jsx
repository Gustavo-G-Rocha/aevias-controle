import React, { useState, useEffect, useMemo } from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { obterEnsaioById } from '@/services/ensaiosService';
import { obterObraById } from '@/services/obrasService';
import { obterRegionalById } from '@/services/regionaisService';
import { obterRegistro } from '@/services/recordsService';
import { carregarCreatorUser } from '@/services/relatorioContextService';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import ExcelExportButton from '@/components/ensaios/ExcelExportButton';
import RelatorioFresagemCBUQ from "@/components/relatorios/RelatorioFresagemCBUQ";
import { mapFresagemToPresentation } from "@/utils/relatorioFresagemCBUQMapper";
import { useReportPdfActions } from '@/hooks/useReportPdfActions';
import { logger } from '@/utils/logger';

export default function RelatorioFresagemCBUQPage() {
  useReportMode();
  const [registro, setRegistro] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [projeto, setProjeto] = useState(null);
  const [creatorUser, setCreatorUser] = useState(null);
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

      const registroData = await obterEnsaioById('RegistroFresagemCBUQ', id);
      setRegistro(registroData);
      setCreatorUser(await carregarCreatorUser(registroData.created_by));

      // Dados relacionados são complementares: falha ao carregá-los não
      // bloqueia o relatório — os campos exibem N/A.
      if (registroData.obra_id) {
        try {
          const obraData = await obterObraById(registroData.obra_id);
          setObra(obraData);

          if (obraData.regional_id) {
            const regionalData = await obterRegionalById(obraData.regional_id);
            setRegional(regionalData);
          }
        } catch (relErr) {
          logger.error("Erro ao carregar obra/regional do relatório:", relErr);
        }
      }

      if (registroData.project_id) {
        try {
          setProjeto(await obterRegistro('Project', registroData.project_id));
        } catch (projErr) {
          logger.error("Erro ao carregar projeto do relatório:", projErr);
        }
      }

      setError(null);
    } catch (err) {
      logger.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do registro de fresagem");
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(
    () => mapFresagemToPresentation({ registro, obra, regional, projeto, creatorUser }),
    [registro, obra, regional, projeto, creatorUser]
  );

  const { handlePrint, downloading } = useReportPdfActions('registro-fresagem-cbuq.pdf');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#00233B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[297mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Registro de Fresagem e Lançamento de CBUQ
          </h2>
          <div className="flex items-center gap-2">
            {registro && <AprovacaoBar entityName="RegistroFresagemCBUQ" recordId={registro.id} />}
            {registro && (
              <ExcelExportButton
                record={{
                  ...registro,
                  entityType: 'RegistroFresagemCBUQ',
                  obra_name: obra?.name ?? registro.obra_name,
                  obra_code: obra?.code ?? registro.obra_code,
                }}
                variant="full"
              />
            )}
            <Button onClick={handlePrint} disabled={downloading} className="bg-[#00233B] text-white hover:bg-[#00233B]/90">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
              {downloading ? 'Gerando...' : 'Imprimir'}
            </Button>
          </div>
        </div>
      </div>

      <div className="report-content-container max-w-[297mm] mx-auto bg-white shadow-lg my-4 print:my-0 print:shadow-none">
        <RelatorioFresagemCBUQ data={data} />
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
            margin: 10mm;
            orphans: 0;
            widows: 0;
          }

          .min-h-screen {
            min-height: 0 !important;
          }
          /* Sem min-height extra: qualquer sobra empurrava uma folha em branco. */
          [data-report-root] {
            min-height: 0 !important;
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