import React from "react";
import { fmtNum, getDensidades, getDensidadeRows } from "@/utils/relatorioBoletimSondagemUtils";

export default function BoletimSondagemDensidade({ boletim }) {
  if (boletim.ensaio_insitu_realizado === false) return null;

  const densidades = getDensidades(boletim);
  if (!densidades.length) return null;

  const rows = getDensidadeRows();

  return (
    <section>
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        MASSA ESPECÍFICA APARENTE IN SITU — DNER-ME 092/94
      </div>
      <table className="w-full border-collapse border border-slate-400 text-[9px]">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-2 py-0.5 text-left font-bold">Campo</th>
            {densidades.map((_, i) => (
              <th key={i} className="border border-slate-400 px-2 py-0.5 text-center font-bold">
                Ensaio {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            if (row.section) {
              return (
                <tr key={ri} className="bg-slate-300">
                  <td
                    colSpan={densidades.length + 1}
                    className="border border-slate-400 px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider text-slate-600"
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }
            return (
              <tr
                key={ri}
                className={row.result ? "bg-slate-200 font-bold" : ri % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="border border-slate-400 px-2 py-0.5 text-gray-700">{row.label}</td>
                {densidades.map((d, di) => (
                  <td
                    key={di}
                    className={`border border-slate-400 px-2 py-0.5 text-center font-semibold ${row.result ? "text-blue-700" : ""}`}
                  >
                    {row.isNum ? fmtNum(d[row.field], row.dec ?? 2) : d[row.field] || "-"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}