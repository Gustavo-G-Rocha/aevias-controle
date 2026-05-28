import React from 'react';

const td = "border border-slate-400 px-1 py-0.5 text-[8px]";
const tdC = "border border-slate-400 px-1 py-0.5 text-center text-[8px]";

export default function LimitesResumo({ pct10, pct40, pct200, ll, lp, ip, ig, hrb }) {
  const rows = [
    ["% Passante #10 (2mm)", pct10 != null ? `${pct10}%` : '-'],
    ["% Passante #40 (0,42mm)", pct40 != null ? `${pct40}%` : '-'],
    ["% Passante #200 (0,075mm)", pct200 != null ? `${pct200}%` : '-'],
    ["Limite de Liquidez (LL)", ll != null ? `${ll}%` : '-'],
    ["Limite de Plasticidade (LP)", lp != null ? `${lp}%` : '-'],
    ["Índice de Plasticidade (IP)", ip != null ? `${ip}%` : '-'],
    ["Índice de Grupo (IG)", ig != null ? `${ig}` : '-'],
    ["Classificação HRB (AASHTO)", hrb ?? '-'],
  ];

  return (
    <div>
      <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Resumo de Caracterização</div>
      <table className="w-full border-collapse border border-slate-400">
        <tbody>
          {rows.map(([label, val]) => (
            <tr key={label} className="odd:bg-white even:bg-slate-50">
              <td className={td + " w-3/4"}>{label}</td>
              <td className={tdC + " font-bold text-blue-800"}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}