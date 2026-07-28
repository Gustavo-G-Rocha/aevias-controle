import React from 'react';
import { useReportMode } from '@/hooks/useReportMode';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import { useRelatorioGranuMisturaData } from '@/hooks/useRelatorioGranuMisturaData';
import { useRelatorioGranuMisturaActions } from '@/hooks/useRelatorioGranuMisturaActions';
import {
  montarPeneirasParaMostrar,
  montarChartData,
} from '@/utils/relatorioGranuMisturaUtils';
import GranuMistraHeader from '@/components/relatorio-granu-mistura/GranuMistraHeader';
import GranuMistraDadosObra from '@/components/relatorio-granu-mistura/GranuMistraDadosObra';
import GranuMisturaTabela from '@/components/relatorio-granu-mistura/GranuMisturaTabela';
import GranuMisturaEnsaios from '@/components/relatorio-granu-mistura/GranuMisturaEnsaios';
import GranuMisturaGrafico from '@/components/relatorio-granu-mistura/GranuMisturaGrafico';
import GranuMisturaAssinaturas from '@/components/relatorio-granu-mistura/GranuMisturaAssinaturas';

export default function RelatorioGranuMistura() {
  useReportMode();
  const { record, faixa, project, obra, regional, loading, error } =
    useRelatorioGranuMisturaData();
  const { imprimirPDF } = useRelatorioGranuMisturaActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error || 'Erro ao carregar'}
      </div>
    );
  }

  const peneirasDoRegistro = record.peneiras || [];
  const peneirasParaMostrar = montarPeneirasParaMostrar(
    faixa,
    peneirasDoRegistro,
  );
  const chartData = montarChartData(peneirasParaMostrar);

  return (
    <div className="relatorio-page bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-3 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-800">
            Relatório — Análise Granulométrica da Mistura
          </h2>
          <div className="flex items-center gap-2">
            {record && (
              <AprovacaoBar
                entityName="GranuMistura"
                recordId={record.id}
              />
            )}
            <Button
              onClick={imprimirPDF}
              className="bg-slate-800 text-white hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" /> Gerar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="report-content-container w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-2 print:p-1 flex flex-col">
        <GranuMistraHeader record={record} regional={regional} />

        <GranuMistraDadosObra
          record={record}
          project={project}
          faixa={faixa}
          obra={obra}
          regional={regional}
        />

        <div className="grid grid-cols-2 gap-2 text-[10px] mt-1">
          <div className="col-span-1">
            <GranuMisturaTabela
              record={record}
              peneirasParaMostrar={peneirasParaMostrar}
            />
          </div>

          <div className="col-span-1">
            <GranuMisturaEnsaios record={record} />
          </div>
        </div>

        <GranuMisturaGrafico chartData={chartData} />

        {record.observacoes && (
          <div className="mt-2 border border-slate-400 p-2 text-[9px] min-h-[40px]">
            <span className="font-semibold">OBS.:</span>
            <div className="mt-1 whitespace-pre-wrap">{record.observacoes}</div>
          </div>
        )}

        <GranuMisturaAssinaturas record={record} />
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          .relatorio-page > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}