import React, { useState, useEffect } from 'react';
import { useCallback } from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import AprovacaoBar from '../components/relatorios/AprovacaoBar';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { obterEnsaioById } from '@/services/ensaiosService';
import { listarObrasRecentes } from '@/services/obrasService';
import { listarProjects } from '@/services/projectsService';
import { listarRegionais } from '@/services/regionaisService';
import { listarFaixas } from '@/services/faixasService';
import RelatorioDensidade from '../components/relatorios/RelatorioDensidade';
import RelatorioMRAF from '../components/relatorios/RelatorioMRAF';
import { useReportPdfActions } from '@/hooks/useReportPdfActions';
import { logger } from '@/utils/logger';

export default function RelatorioEnsaio() {
  useReportMode();
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });

  const loadReportData = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      const tipo = urlParams.get('tipo');

      if (!id || !tipo) throw new Error('ID e tipo são obrigatórios na URL');

      const user = await obterUsuarioAtual();
      
      const entityMap = { densidade: 'EnsaioDensidade', mraf: 'EnsaioMRAF' };
      const entityName = entityMap[tipo];
      if (!entityName) throw new Error(`Tipo de relatório inválido: ${tipo}`);

      const [record, obras, projects, regionais] = await Promise.all([
        obterEnsaioById(entityName, id),
        listarObrasRecentes(),
        listarProjects(),
        listarRegionais()
      ]);

      // Note: 'diario' type is now handled by a separate dedicated page/component.
      // If 'tipo' is 'diario' here, 'entityName' will be undefined and the check
      // above will correctly report it as an invalid type for this page.

      if (!record) throw new Error(`Registro ${tipo} com ID ${id} não encontrado`);

      let obra = null;
      let project = null;
      let regional = null;
      let faixaGranulometrica = null;
      
      if (record.obra_id) {
        obra = obras.find(o => o.id === record.obra_id);
        if (obra && obra.regional_id) {
          regional = regionais.find(r => r.id === obra.regional_id);
        }
      }
      
      if (record.project_id) {
        project = projects.find(p => p.id === record.project_id);
        if (project && project.faixa_granulometrica_id) {
          const faixas = await listarFaixas();
          faixaGranulometrica = faixas.find(f => f.id === project.faixa_granulometrica_id);
        }
      }

      setState({
        loading: false,
        error: null,
        data: { tipo, record, obra, project, user, regional, faixaGranulometrica }
      });
    } catch (error) {
      logger.error('Erro ao carregar relatório:', error);
      setState({ loading: false, error: error.message, data: null });
    }
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // No PC abre "Salvar como"; no celular baixa direto.
  const { handlePrint, downloading } = useReportPdfActions('relatorio-ensaio.pdf');

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

  const renderReport = () => {
    if (!state.data) return null;
    const { tipo, record, obra, project, user, regional, faixaGranulometrica } = state.data;
    switch (tipo) {
      case 'densidade':
        return <RelatorioDensidade ensaio={record} obra={obra} project={project} user={user} regional={regional} />;
      case 'mraf':
        return <RelatorioMRAF ensaio={record} obra={obra} project={project} user={user} regional={regional} faixaGranulometrica={faixaGranulometrica} />;
      default:
        return <div>Tipo de relatório inválido</div>;
    }
  };

  const getTipoRelatorioNome = () => {
    if (state.data?.tipo === 'densidade') return 'Densidade CP Extraído';
    if (state.data?.tipo === 'mraf') return 'Ensaio MRAF';
    return 'Relatório de Ensaio';
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Relatório de {getTipoRelatorioNome()}
          </h2>
          <div className="flex items-center gap-2">
            {state.data && (() => {
              const entityMap = { densidade: 'EnsaioDensidade', mraf: 'EnsaioMRAF' };
              const en = entityMap[state.data.tipo];
              return en ? <AprovacaoBar entityName={en} recordId={state.data.record?.id} /> : null;
            })()}
            <Button onClick={handlePrint} disabled={downloading} className="bg-slate-800 text-white hover:bg-slate-700">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {downloading ? 'Gerando...' : 'Gerar PDF'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="report-content-container w-full bg-white print:bg-white">
        {renderReport()}
      </div>

      <style>{`
        @media screen {
          .report-content-container {
            max-width: 210mm; /* A4 width */
            margin: 0 auto;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        }
        
        @media print {
          * {
            box-sizing: border-box;
          }
          
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
          
          .break-before-page { 
            page-break-before: always; 
            break-before: page;
          }
          
          .break-inside-avoid { 
            page-break-inside: avoid; 
            break-inside: avoid;
          }
          
          @page {
            size: A4;
            margin: 0;
            padding: 0;
          }
          
          /* Force content to respect page boundaries and prevent overflow in print */
          body > * {
            max-width: 100vw !important;
            overflow: visible !important; /* Changed from 100vw to visible to allow content to flow */
          }
        }
      `}</style>
    </div>
  );
}