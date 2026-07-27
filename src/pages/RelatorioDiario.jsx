import React from 'react';
import { useReportMode } from "@/hooks/useReportMode";
import { Loader2 } from "lucide-react";
import { useRelatorioDiarioData } from '@/hooks/useRelatorioDiarioData';
import { useRelatorioDiarioActions } from '@/hooks/useRelatorioDiarioActions';
import RelatorioDiarioComponent from '@/components/relatorios/RelatorioDiario';
import RelatorioDiarioHeader from '@/components/relatorio-diario/RelatorioDiarioHeader';
import RelatorioDiarioContainer from '@/components/relatorio-diario/RelatorioDiarioContainer';

export default function RelatorioDiarioPage() {
  useReportMode();

  const { diario, obra, project, user, regional, creatorUser, loading, error } = useRelatorioDiarioData();
  const { handlePrint, downloading } = useRelatorioDiarioActions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !diario) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">{error || 'Erro ao carregar relatório'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <RelatorioDiarioHeader diario={diario} onPrint={handlePrint} downloading={downloading} />
      
      <RelatorioDiarioContainer>
        <RelatorioDiarioComponent 
          diario={diario} 
          obra={obra} 
          project={project} 
          user={user}
          regional={regional}
          creatorUser={creatorUser}
        />
      </RelatorioDiarioContainer>
    </div>
  );
}