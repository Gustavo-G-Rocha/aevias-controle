import React from 'react';
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";
import { useRelatorioChecklistData } from '@/hooks/useRelatorioChecklistData';
import { useRelatorioChecklistActions } from '@/hooks/useRelatorioChecklistActions';
import RelatorioChecklistComponent from '@/components/relatorios/RelatorioChecklist';
import RelatorioChecklistHeader from '@/components/relatorio-checklist/RelatorioChecklistHeader';
import RelatorioChecklistContainer from '@/components/relatorio-checklist/RelatorioChecklistContainer';

export default function RelatorioChecklistPage() {
  useReportMode();

  const { checklist, obra, regional, project, user, creatorUser, loading, error } = useRelatorioChecklistData();
  const { handlePrint } = useRelatorioChecklistActions();

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
      <RelatorioChecklistHeader checklist={checklist} onPrint={handlePrint} />
      
      <RelatorioChecklistContainer>
        <RelatorioChecklistComponent 
          checklist={checklist} 
          obra={obra} 
          regional={regional} 
          project={project} 
          user={user}
          creatorUser={creatorUser}
        />
      </RelatorioChecklistContainer>
    </div>
  );
}