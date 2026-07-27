import React from 'react';
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";
import { useRelatorioChecklistAplicacaoData } from '@/hooks/useRelatorioChecklistAplicacaoData';
import { useRelatorioChecklistAplicacaoActions } from '@/hooks/useRelatorioChecklistAplicacaoActions';
import RelatorioChecklistAplicacaoComponent from '@/components/relatorios/RelatorioChecklistAplicacao';
import RelatorioChecklistAplicacaoHeader from '@/components/relatorio-checklist-aplicacao/RelatorioChecklistAplicacaoHeader';
import RelatorioChecklistAplicacaoContainer from '@/components/relatorio-checklist-aplicacao/RelatorioChecklistAplicacaoContainer';

export default function RelatorioChecklistAplicacaoPage() {
  useReportMode();

  const { checklist, obra, regional, project, user, creatorUser, loading, error } = useRelatorioChecklistAplicacaoData();
  const { handlePrint, downloading } = useRelatorioChecklistAplicacaoActions();

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

  if (error || !checklist) {
    return (
      <div className="p-8 text-center text-red-600">
        Erro: {error || 'Checklist não encontrado'}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <RelatorioChecklistAplicacaoHeader checklist={checklist} onPrint={handlePrint} downloading={downloading} />
      
      <RelatorioChecklistAplicacaoContainer>
        <RelatorioChecklistAplicacaoComponent 
          checklist={checklist} 
          obra={obra} 
          regional={regional} 
          project={project}
          user={user}
          creatorUser={creatorUser}
        />
      </RelatorioChecklistAplicacaoContainer>
    </div>
  );
}