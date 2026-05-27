/**
 * Renderiza relatório de registro vinculado (Diário, Checklist, etc).
 */
import React from 'react';
import RelatorioDiarioComponent from '@/components/relatorios/RelatorioDiario';
import RelatorioChecklistComponent from '@/components/relatorios/RelatorioChecklist';
import RelatorioChecklistAplicacaoComponent from '@/components/relatorios/RelatorioChecklistAplicacao';
import RelatorioChecklistMRAFComponent from '@/components/relatorios/RelatorioChecklistMRAF';
import RelatorioChecklistConcretagemComponent from '@/components/relatorios/RelatorioChecklistConcretagem';
import RelatorioChecklistTerraplanagem from '@/components/relatorios/RelatorioChecklistTerraplanagem';
import RelatorioChecklistReciclagem from '@/components/relatorios/RelatorioChecklistReciclagem';

export default function VinculadoReport({
  tipo,
  registro,
  obra,
  regional,
  project,
  creatorUser,
  user,
}) {
  if (!tipo || !registro) return null;

  const props = { obra, regional, project, user, creatorUser };

  if (tipo === 'DiarioObra')
    return <RelatorioDiarioComponent diario={registro} {...props} />;
  if (tipo === 'ChecklistUsina')
    return <RelatorioChecklistComponent checklist={registro} {...props} />;
  if (tipo === 'ChecklistAplicacao')
    return (
      <RelatorioChecklistAplicacaoComponent checklist={registro} {...props} />
    );
  if (tipo === 'ChecklistMRAF')
    return (
      <RelatorioChecklistMRAFComponent checklist={registro} {...props} />
    );
  if (tipo === 'ChecklistConcretagem')
    return (
      <RelatorioChecklistConcretagemComponent
        checklist={registro}
        creatorUser={creatorUser}
      />
    );
  if (tipo === 'ChecklistTerraplanagem')
    return (
      <RelatorioChecklistTerraplanagem
        checklist={registro}
        creatorUser={creatorUser}
      />
    );
  if (tipo === 'ChecklistReciclagem')
    return <RelatorioChecklistReciclagem checklist={registro} {...props} />;

  return null;
}