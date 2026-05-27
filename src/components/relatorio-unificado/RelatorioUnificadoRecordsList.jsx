import React from 'react';
import RecordRenderer from './RecordRenderer';

export default function RelatorioUnificadoRecordsList({ records, obra, regional, projects, user }) {
  if (records.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">Nenhum registro encontrado com os filtros selecionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 print:px-0">
      <div className="space-y-0">
        {records.map((record, index) => {
          const project = projects.find(p => p.id === record.project_id);
          return (
            <div
              key={record.id}
              className="print:break-before-page"
              style={{ breakBefore: index > 0 ? 'page' : 'auto' }}
            >
              {index > 0 && (
                <div className="print:hidden my-8 flex items-center gap-4">
                  <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white px-3">
                    Registro {index + 1} de {records.length}
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                </div>
              )}
              <RecordRenderer
                record={record}
                obra={obra}
                regional={regional}
                project={project}
                user={user}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}