import React from "react";
import { formatDate } from "@/utils/relatorioBoletimSondagemUtils";

export default function BoletimSondagemDadosObra({ boletim, obra, regional }) {
  const fields = [
    ["OBRA", obra?.name || "-"],
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
      <div className="bg-[#BFCF99] text-[#00233B] px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        DADOS DA OBRA
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[10px]">
        {fields.map(([label, val]) => (
          <div key={label}>
            <span className="font-bold text-gray-700">{label}: </span>
            <span className="text-gray-900">{val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}