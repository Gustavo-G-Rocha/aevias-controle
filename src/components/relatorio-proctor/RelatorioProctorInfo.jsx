import React from 'react';
import { fmtN } from '@/utils/relatorioProctorUtils';

export default function RelatorioProctorInfo({ infoFields, ensaio, parabola, iscAtWotima, expAtWotima }) {
  return (
    <>
      {/* INFO */}
      <section>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-[9px] border border-slate-300 p-1 rounded">
          {infoFields.map(([label, val]) => (
            <div key={label}>
              <span className="font-bold text-gray-700">{label}: </span>
              <span className="text-gray-900">{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RESULTADOS FINAIS */}
      <section>
        <div className="bg-slate-200 px-2 py-0.5 font-bold text-[9px] mb-0.5 text-center">RESULTADOS FINAIS</div>
        <div className="border border-slate-300 flex gap-2 text-[8px] px-2 py-1">
          {[
            ["Dens. Máx. (g/cm³)", fmtN(ensaio.densidade_maxima_seca || parabola?.gamma_max, 3)],
            ["Umid. Ótima (%)",     fmtN(ensaio.umidade_otima || parabola?.w_otima, 2)],
            ["ISC/CBR (%)",         fmtN(iscAtWotima ?? ensaio.isc_cbr, 2)],
            ["Exp. (%)",            fmtN(expAtWotima ?? ensaio.expansao, 2)],
          ].map(([label, val]) => (
            <div key={label} className="flex-1">
              <div style={{ fontSize: '7px' }} className="text-gray-600">{label}</div>
              <div className="font-bold text-blue-800">{val}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}