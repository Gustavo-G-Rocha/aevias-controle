import React from "react";

const _infoFieldsLabels = [
  "ESTRUTURA",
  "CONSTRUTORA",
  "NOTA FISCAL",
  "ESTACA DE MOLDAGEM",
  "SLUMP TEST (mm)",
  "HORA DE SAÍDA DA USINA",
  "TEMPERATURA AMBIENTE (°C)",
  "HORA DE CHEGADA CAMPO",
];

export default function RelatorioRompimentoDadosEnsaio({ ensaio }) {
  const infoFields = [
    ["ESTRUTURA", ensaio.estrutura || ""],
    ["CONSTRUTORA", ensaio.construtora || ""],
    ["NOTA FISCAL", ensaio.nota_fiscal || ""],
    ["ESTACA DE MOLDAGEM", ensaio.estaca_moldagem || ""],
    ["SLUMP TEST (mm)", ensaio.slump_test ?? ""],
    ["HORA DE SAÍDA DA USINA", ensaio.hora_saida_usina || ""],
    ["TEMPERATURA AMBIENTE (°C)", ensaio.temperatura_ambiente ?? ""],
    ["HORA DE CHEGADA CAMPO", ensaio.hora_chegada_campo || ""],
  ];

  return (
    <>
      <div
        style={{ backgroundColor: "#1e293b" }}
        className="text-white px-2 py-0.5 font-bold text-center text-[10px] mt-4"
      >
        DADOS DO ENSAIO
      </div>
      <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-[9px] p-2 mb-0">
        {infoFields.map(([label, val]) => (
          <div key={label}>
            <span className="font-semibold text-gray-800">{label}: </span>
            <span className="text-gray-900">{val}</span>
          </div>
        ))}
      </div>
    </>
  );
}