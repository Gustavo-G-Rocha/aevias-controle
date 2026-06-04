import React from 'react';
import { getEnsaioTypeInfo, getDataEnsaio } from '@/components/ensaios/ensaioMappers';

// Importar todos os componentes de relatório
import RelatorioChecklist from '@/components/relatorios/RelatorioChecklist';
import RelatorioChecklistAplicacao from '@/components/relatorios/RelatorioChecklistAplicacao';
import RelatorioChecklistMRAF from '@/components/relatorios/RelatorioChecklistMRAF';
import RelatorioChecklistConcretagem from '@/components/relatorios/RelatorioChecklistConcretagem';
import RelatorioChecklistTerraplanagem from '@/components/relatorios/RelatorioChecklistTerraplanagem';
import RelatorioChecklistReciclagem from '@/components/relatorios/RelatorioChecklistReciclagem';
import RelatorioDiario from '@/components/relatorios/RelatorioDiario';
import RelatorioDensidade from '@/components/relatorios/RelatorioDensidade';
import RelatorioDensidadeInSitu from '@/components/relatorios/RelatorioDensidadeInSitu';
import RelatorioTaxaPinturaImprimacao from '@/components/relatorios/RelatorioTaxaPinturaImprimacao';
import RelatorioAcompanhamentoUsinagem from '@/components/relatorios/RelatorioAcompanhamentoUsinagem';
import RelatorioAcompanhamentoCarga from '@/components/relatorios/RelatorioAcompanhamentoCarga';
import RelatorioManchaPendulo from '@/components/relatorios/RelatorioManchaPendulo';
import RelatorioGranulometriaIndividual from '@/components/relatorios/RelatorioGranulometriaIndividual';
import RelatorioGranuMistura from '@/components/relatorios/RelatorioGranuMistura';
import RelatorioMRAF from '@/components/relatorios/RelatorioMRAF';
import RelatorioTaxaMRAF from '@/components/relatorios/RelatorioTaxaMRAF';

function DefaultRecordCard({ record }) {
  const typeInfo = getEnsaioTypeInfo(record);
  const dataFormatted = getDataEnsaio(record)
    ? new Date(getDataEnsaio(record)).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : '-';
  return (
    <div className="border-2 border-slate-300 rounded-lg p-6 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg font-bold text-slate-700">{typeInfo.name}</span>
        <span className="text-sm text-slate-500">— {dataFormatted}</span>
      </div>
      <p className="text-sm text-slate-500">
        Laboratorista: {record.laboratorista_name || record.created_by || 'N/A'}
      </p>
      {record.observacoes && (
        <p className="text-sm text-slate-600 mt-2">{record.observacoes}</p>
      )}
    </div>
  );
}

export default function RecordRenderer({ record, obra, regional, project, faixaGranulometrica, user }) {
  const entityType = record.entityType;

  switch (entityType) {
    case 'DiarioObra':
      return <RelatorioDiario diario={record} obra={obra} regional={regional} creator={user} />;
    case 'ChecklistUsina':
      return <RelatorioChecklist checklist={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'ChecklistAplicacao':
      return <RelatorioChecklistAplicacao checklist={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'ChecklistMRAF':
      return <RelatorioChecklistMRAF checklist={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'ChecklistConcretagem':
      return <RelatorioChecklistConcretagem checklist={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'ChecklistTerraplanagem':
      return <RelatorioChecklistTerraplanagem checklist={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'ChecklistReciclagem':
      return <RelatorioChecklistReciclagem checklist={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'EnsaioDensidade':
      return <RelatorioDensidade ensaio={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'EnsaioDensidadeInSitu':
      return <RelatorioDensidadeInSitu ensaio={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'EnsaioTaxaPinturaImprimacao':
      return <RelatorioTaxaPinturaImprimacao ensaio={record} obra={obra} regional={regional} user={user} />;
    case 'AcompanhamentoUsinagem':
      return <RelatorioAcompanhamentoUsinagem ensaio={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'AcompanhamentoCarga':
      return <RelatorioAcompanhamentoCarga ensaio={record} obra={obra} regional={regional} user={user} />;
    case 'EnsaioManchaPendulo':
      return <RelatorioManchaPendulo ensaio={record} obra={obra} regional={regional} user={user} />;
    case 'EnsaioGranulometriaIndividual':
      return <RelatorioGranulometriaIndividual ensaio={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'GranuMistura':
      return <RelatorioGranuMistura ensaio={record} obra={obra} regional={regional} project={project} user={user} />;
    case 'EnsaioMRAF':
      return <RelatorioMRAF ensaio={record} obra={obra} regional={regional} project={project} faixaGranulometrica={faixaGranulometrica} user={user} />;
    case 'EnsaioTaxaMRAF':
      return <RelatorioTaxaMRAF ensaio={record} obra={obra} regional={regional} user={user} />;
    case 'EnsaioCAUQ':
      return (
        <div className="bg-white min-h-screen">
          <iframe
            src={`/RelatorioCAUQ?id=${record.id}`}
            className="w-full h-screen border-0"
            title="Relatório de Ensaio CAUQ"
          />
        </div>
      );
    default:
      return <DefaultRecordCard record={record} />;
  }
}