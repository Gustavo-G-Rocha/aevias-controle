import React from 'react';
import { useReportMode } from '@/hooks/useReportMode';
import { Loader2 } from 'lucide-react';
import { useRelatorioUnificadoData } from '@/hooks/useRelatorioUnificadoData';
import { useRelatorioUnificadoFilters } from '@/hooks/useRelatorioUnificadoFilters';
import { useRelatorioUnificadoRecords } from '@/hooks/useRelatorioUnificadoRecords';
import { useRelatorioUnificadoActions } from '@/hooks/useRelatorioUnificadoActions';
import RelatorioUnificadoToolbar from '@/components/relatorio-unificado/RelatorioUnificadoToolbar';
import RelatorioUnificadoCapa from '@/components/relatorio-unificado/RelatorioUnificadoCapa';
import RelatorioUnificadoRecordsList from '@/components/relatorio-unificado/RelatorioUnificadoRecordsList';

export default function RelatorioUnificado() {
  useReportMode();

  const { obra, regional, projects, faixasGranulometricas, user, loading: dataLoading, error: dataError } = useRelatorioUnificadoData();
  const { filters, hasValidFilters } = useRelatorioUnificadoFilters();
  const { records, loading: recordsLoading, error: recordsError } = useRelatorioUnificadoRecords({ filters, hasValidFilters });
  const { handleGoBack, handlePrint } = useRelatorioUnificadoActions();

  const loading = dataLoading || recordsLoading;
  const error = dataError || recordsError || (!hasValidFilters && 'Parâmetros insuficientes.');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
        <p className="text-slate-500">Carregando registros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <RelatorioUnificadoToolbar
        obra={obra}
        filters={filters}
        recordCount={records.length}
        onGoBack={handleGoBack}
        onPrint={handlePrint}
      />

      <RelatorioUnificadoCapa
        obra={obra}
        regional={regional}
        filters={filters}
        recordCount={records.length}
      />

      <RelatorioUnificadoRecordsList
        records={records}
        obra={obra}
        regional={regional}
        projects={projects}
        faixasGranulometricas={faixasGranulometricas}
        user={user}
      />

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          aside, nav, [data-sidebar] { display: none !important; }
        }
      `}</style>
    </div>
  );
}