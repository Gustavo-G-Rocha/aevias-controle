import React from 'react';
import { useReportMode } from '@/hooks/useReportMode';
import { Loader2 } from 'lucide-react';
import { useRelatorioUnificadoData } from '@/hooks/useRelatorioUnificadoData';
import { useRelatorioUnificadoFilters } from '@/hooks/useRelatorioUnificadoFilters';
import { useRelatorioUnificadoRecords } from '@/hooks/useRelatorioUnificadoRecords';
import { useRelatorioUnificadoActions } from '@/hooks/useRelatorioUnificadoActions';
import { useRelatorioUnificadoSignature } from '@/hooks/useRelatorioUnificadoSignature';
import RelatorioUnificadoToolbar from '@/components/relatorio-unificado/RelatorioUnificadoToolbar';
import RelatorioUnificadoCapa from '@/components/relatorio-unificado/RelatorioUnificadoCapa';
import RelatorioUnificadoRecordsList from '@/components/relatorio-unificado/RelatorioUnificadoRecordsList';
import SignatureReauthModal from '@/components/relatorios/SignatureReauthModal';
import SignatureSeal from '@/components/relatorios/SignatureSeal';

export default function RelatorioUnificado() {
  useReportMode();

  const { obra, regional, projects, faixasGranulometricas, user, loading: dataLoading, error: dataError } = useRelatorioUnificadoData();
  const { filters, hasValidFilters } = useRelatorioUnificadoFilters();
  const { records, loading: recordsLoading, error: recordsError } = useRelatorioUnificadoRecords({ filters, hasValidFilters });
  const { handleGoBack, handlePrint } = useRelatorioUnificadoActions();
  const {
    signature,
    signing,
    modalOpen,
    signError,
    canSign,
    handleSign,
    handleOpenModal,
    handleCloseModal,
  } = useRelatorioUnificadoSignature({ filters, recordCount: records.length, user });

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
      <div className="flex flex-col justify-center items-center h-screen gap-4 px-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          onClick={handleGoBack}
          className="px-4 py-2 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700 transition-colors"
        >
          Voltar aos Relatórios
        </button>
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
        onSign={handleOpenModal}
        signature={signature}
        canSign={canSign}
      />

      <RelatorioUnificadoCapa
        obra={obra}
        regional={regional}
        filters={filters}
        recordCount={records.length}
      />

      {signature && (
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <SignatureSeal signature={signature} />
        </div>
      )}

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

      <SignatureReauthModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSign}
        signerName={user?.laboratorista_name || user?.full_name || user?.email || ''}
        documentDescription="Relatório Unificado Consolidado"
        loading={signing}
        error={signError}
      />
    </div>
  );
}