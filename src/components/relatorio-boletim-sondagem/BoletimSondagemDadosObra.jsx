import React from "react";
import { formatDate } from "@/utils/relatorioBoletimSondagemUtils";

const SECTION_BAND =
  "bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1";

const Field = ({ label, value }) => (
  <div className="flex items-end gap-1 text-[10px] leading-tight">
    <span className="font-bold whitespace-nowrap text-[#00233B] pb-0.5 w-16 flex-shrink-0">{label}:</span>
    <span className="flex-1 border-b border-[#94a3b8] text-[#00233B] pb-0.5 min-w-0">{value}</span>
  </div>
);

export default function BoletimSondagemDadosObra({ boletim, obra, regional }) {
  const fields = [
    ["OBRA", obra?.name || boletim.obra_name || "-"],
    ["CLIENTE", boletim.cliente || regional?.cliente || "-"],
    ["DATA", formatDate(boletim.data)],
    ["RODOVIA", boletim.rodovia || "-"],
    ["KM", boletim.km || "-"],
    ["PISTA", boletim.pista || "-"],
    ["BORDO", boletim.bordo || "-"],
    ["FURO", boletim.furo || "-"],
    ["OPERADOR", boletim.operador || boletim.laboratorista_name || "-"],
  ];

  return (
    <section className="mb-1">
      <div className={SECTION_BAND}>Dados da Obra</div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 px-2 py-1">
        {fields.map(([label, val]) => (
          <Field key={label} label={label} value={val} />
        ))}
      </div>
    </section>
  );
}