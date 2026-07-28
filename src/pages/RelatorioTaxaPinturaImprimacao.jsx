import React, { useState, useEffect } from 'react';
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import AprovacaoBar from '../components/relatorios/AprovacaoBar';
import { obterEnsaioById } from '@/services/ensaiosService';
import { obterObraById } from '@/services/obrasService';
import { obterRegionalById } from '@/services/regionaisService';
import { isAuthenticated } from '@/services/usuariosService';
import RelatorioTaxaPinturaImprimacaoComponent from '../components/relatorios/RelatorioTaxaPinturaImprimacao';
import { useReportPdfActions } from '@/hooks/useReportPdfActions';
import { logger } from '@/utils/logger';

export default function RelatorioTaxaPinturaImprimacaoPage() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });

  useReportMode();

  const loadReportData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      if (!id) throw new Error('ID do ensaio é obrigatório na URL');

      const isAuth = await isAuthenticated();
      if (!isAuth) {
        throw new Error('Você precisa estar autenticado para visualizar este relatório');
      }

      const ensaio = await obterEnsaioById('EnsaioTaxaPinturaImprimacao', id);
      if (!ensaio) throw new Error(`Ensaio com ID ${id} não encontrado`);

      let obra = null;
      let regional = null;
      if (ensaio.obra_id) {
        try {
          obra = await obterObraById(ensaio.obra_id);
        } catch {
          logger.warn("Obra não encontrada:", ensaio.obra_id);
        }
        
        if (obra && obra.regional_id) {
          try {
            regional = await obterRegionalById(obra.regional_id);
          } catch {
            logger.warn("Regional não encontrada:", obra.regional_id);
          }
        }
      }

      setState({
        loading: false,
        error: null,
        data: { ensaio, obra, regional }
      });
    } catch (error) {
      logger.error('Erro ao carregar relatório:', error);
      setState({ loading: false, error: error.message, data: null });
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // No PC abre "Salvar como"; no celular baixa direto.
  const { handlePrint, downloading } = useReportPdfActions('relatorio-taxa-pintura-imprimacao.pdf');

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-slate-700">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return <div className="p-8 text-center text-red-600">Erro: {state.error}</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Relatório de Taxa de Pintura/Imprimação
          </h2>
          <div className="flex items-center gap-2">
            {state.data && <AprovacaoBar entityName="EnsaioTaxaPinturaImprimacao" recordId={state.data.ensaio?.id} />}
            <Button onClick={handlePrint} disabled={downloading} className="bg-slate-800 text-white hover:bg-slate-700">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {downloading ? 'Gerando...' : 'Imprimir'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="report-content-container w-full bg-white print:bg-white">
        {state.data && (
          <RelatorioTaxaPinturaImprimacaoComponent 
            ensaio={state.data.ensaio} 
            obra={state.data.obra} 
            regional={state.data.regional}
          />
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
          .no-print, .no-print * { display: none !important; visibility: hidden !important; }
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
            padding: 0;
          }
          body > * {
            max-width: 100vw !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}