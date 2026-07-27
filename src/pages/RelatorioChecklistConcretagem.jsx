import React from 'react';
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";
import { useRelatorioChecklistConcretagemData } from '@/hooks/useRelatorioChecklistConcretagemData';
import { useRelatorioChecklistConcretagemActions } from '@/hooks/useRelatorioChecklistConcretagemActions';
import RelatorioChecklistConcretagemComponent from '@/components/relatorios/RelatorioChecklistConcretagem';
import RelatorioChecklistConcretagemHeader from '@/components/relatorio-checklist-concretagem/RelatorioChecklistConcretagemHeader';
import RelatorioChecklistConcretagemContainer from '@/components/relatorio-checklist-concretagem/RelatorioChecklistConcretagemContainer';

export default function RelatorioChecklistConcretagemPage() {
  useReportMode();

  const { checklist, creatorUser, obra, regional, project, loading, error } = useRelatorioChecklistConcretagemData();
  const { handlePrint, downloading } = useRelatorioChecklistConcretagemActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">{error || 'Checklist não encontrado'}</p>
      </div>
    );
  }

  return (
    <RelatorioChecklistConcretagemContainer>
      <RelatorioChecklistConcretagemHeader checklist={checklist} onPrint={handlePrint} downloading={downloading} />
      <RelatorioChecklistConcretagemComponent checklist={checklist} creatorUser={creatorUser} obra={obra} regional={regional} project={project} />
    </RelatorioChecklistConcretagemContainer>
  );
}