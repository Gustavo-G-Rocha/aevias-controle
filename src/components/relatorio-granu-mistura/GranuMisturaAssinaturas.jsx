/**
 * Seção de assinaturas do relatório.
 */
import React from 'react';
import { formatDateTime } from '@/utils/relatorioGranuMisturaUtils';

function AssinaturaCol({ cargoFixo, nome, email, data, crea, label }) {
  return (
    <div className="text-center">
      <div className="text-[8px] text-slate-500 mb-2 h-14 flex flex-col justify-end items-center">
        {nome && (
          <>
            {label && (
              <p className="text-[7px] text-gray-400 italic">{label}</p>
            )}
            <p className="text-black">{nome}</p>
            {email && <p className="text-[7px]">{email}</p>}
            {crea && <p className="text-[7px]">CREA: {crea}</p>}
            {data && <p className="text-[7px]">em {formatDateTime(data)}</p>}
          </>
        )}
      </div>
      <div className="border-t-2 border-gray-500 pt-1 w-3/4 mx-auto">
        <p className="font-semibold text-[8px]">{cargoFixo}</p>
      </div>
    </div>
  );
}

export default function GranuMisturaAssinaturas({ record }) {
  return (
    <footer className="mt-auto pt-4">
      <div className="grid grid-cols-3 gap-6 text-center">
        <AssinaturaCol
          cargoFixo="Laboratorista"
          nome={record.laboratorista_name}
          email={record.created_by}
          data={record.created_date}
          label="Assinado digitalmente por"
        />
        <AssinaturaCol
          cargoFixo="Engenheiro Responsável"
          nome={record.approver_details?.name}
          email={record.approved_by}
          data={record.approved_date}
          crea={record.approver_details?.crea_number}
          label="Aprovado digitalmente por"
        />
        <AssinaturaCol
          cargoFixo="Engenheiro Cliente"
          nome={record.client_signature?.engineer_name}
          email={record.client_signature?.signed_by}
          data={record.client_signature?.signed_date}
          crea={record.client_signature?.crea_number}
          label="Assinado digitalmente por"
        />
      </div>
    </footer>
  );
}