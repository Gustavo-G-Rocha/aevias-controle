import React from 'react';
import { fmtDateTime } from '@/utils/relatorioLimitesUtils';

function SignatureCol({ title, name, email, crea, date }) {
  return (
    <div className="text-center">
      <div className="text-[8px] text-slate-500 mb-2 h-16 flex flex-col justify-end items-center">
        {name && (
          <>
            <p className="text-black">{name}</p>
            {email && <p>{email}</p>}
            {crea && <p>CREA: {crea}</p>}
            {date && <p>em {fmtDateTime(date)}</p>}
          </>
        )}
      </div>
      <div className="border-t-2 border-gray-500 pt-1 w-3/4 mx-auto">
        <p className="font-semibold text-[8px]">{title}</p>
      </div>
    </div>
  );
}

export default function LimitesAssinaturas({ ensaio }) {
  if (!ensaio) return null;
  return (
    <footer className="mt-4 pt-2">
      <div className="grid grid-cols-3 gap-8 items-end">
        <SignatureCol
          title="LABORATORISTA RESPONSÁVEL"
          name={ensaio.laboratorista_name}
          email={ensaio.created_by}
          date={ensaio.created_date}
        />
        <SignatureCol
          title="ENGENHEIRO RESPONSÁVEL"
          name={ensaio.approver_details?.name}
          email={ensaio.approved_by}
          crea={ensaio.approver_details?.crea_number}
          date={ensaio.approved_date}
        />
        <SignatureCol
          title="ENGENHEIRO CLIENTE"
          name={ensaio.client_signature?.engineer_name}
          email={ensaio.client_signature?.signed_by}
          crea={ensaio.client_signature?.crea_number}
          date={ensaio.client_signature?.signed_date}
        />
      </div>
    </footer>
  );
}