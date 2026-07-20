import React from "react";
import { fmtNum, getDensidades, getDensidadeRows } from "@/utils/relatorioBoletimSondagemUtils";

const SECTION_BAND =
  "bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1";
const TABLE = "w-full border-collapse border border-[#94a3b8] text-[9px]";
const TH = "border border-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 font-bold text-[#00233B]";
const TD = "border border-[#94a3b8] px-2 py-0.5 text-[#00233B]";

export default function BoletimSondagemDensidade({ boletim }) {
  if (boletim.ensaio_insitu_realizado === false) return null;

  const densidades = getDensidades(boletim);
  if (!densidades.length) return null;

  const rows = getDensidadeRows();

  return (
    <section>
      <div className={SECTION_BAND}>Massa Específica Aparente in Situ — DNER-ME 092/94</div>
      <table className={TABLE}>
        <thead>
          <tr>
            <th className={TH + " text-left"}>Campo</th>
            {densidades.map((_, i) => (
              <th key={i} className={TH + " text-center"}>
                Ensaio {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            if (row.section) {
              return (
                <tr key={ri} className="bg-[#BFCF99]">
                  <td
                    colSpan={densidades.length + 1}
                    className="border border-[#94a3b8] px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider text-[#00233B]"
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }
            return (
              <tr key={ri} className={row.result ? "bg-[#f1f5f9]" : "bg-white"}>
                <td className={TD + " text-left"}>{row.label}</td>
                {densidades.map((d, di) => (
                  <td
                    key={di}
                    className={TD + " text-center " + (row.result ? "font-bold text-[#00233B]" : "")}
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