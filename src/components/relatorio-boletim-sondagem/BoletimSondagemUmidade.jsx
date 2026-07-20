import React from "react";
import { fmtNum, calcUmidadeNatural2, calcMediaUmidade } from "@/utils/relatorioBoletimSondagemUtils";

function UmidadeTable({ uData, umidMedia }) {
  const rows = [
    ["Nº cápsula", uData.no_capsula_1, uData.no_capsula_2, false],
    ["Massa cápsula (g)", uData.massa_capsula_1, uData.massa_capsula_2, true],
    ["Massa cap + solo úmido (g)", uData.massa_cap_solo_umido_1, uData.massa_cap_solo_umido_2, true],
    ["Massa cap + solo seco (g)", uData.massa_cap_solo_seco_1, uData.massa_cap_solo_seco_2, true],
  ];

  return (
    <table className="w-full border-collapse border border-[#BFCF99] text-[9px]">
      <thead>
        <tr className="bg-[#E8EDD5]">
          <th className="border border-[#BFCF99] px-1 py-0.5 text-left font-bold">Campo</th>
          <th className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">Am. 1</th>
          <th className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">Am. 2</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, v1, v2, isNum], ri) => (
          <tr key={ri} className={"bg-white"}>
            <td className="border border-[#BFCF99] px-1 py-0.5 text-gray-700">{label}</td>
            <td className="border border-[#BFCF99] px-1 py-0.5 text-center">{isNum ? fmtNum(v1) : v1 || "-"}</td>
            <td className="border border-[#BFCF99] px-1 py-0.5 text-center">{isNum ? fmtNum(v2) : v2 || "-"}</td>
          </tr>
        ))}
        <tr className="bg-[#E8EDD5] font-bold">
          <td className="border border-[#BFCF99] px-1 py-0.5 font-bold">Umidade (%)</td>
          <td className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold text-[#00233B]" colSpan={2}>
            {umidMedia}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default function BoletimSondagemUmidade({ boletim }) {
  const un = boletim.umidade_natural || {};
  const umid1Media = calcMediaUmidade(un.umidade_1, un.umidade_2);

  return (
    <section>
      <div className="bg-[#BFCF99] text-[#00233B] px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        UMIDADE NATURAL — DNER-ME 213/94
      </div>

      {!boletim.umidade_natural_2 ? (
        <div>
          <div className="bg-white font-bold text-[9px] border border-[#BFCF99] px-1 py-0.5 mb-0.5">
            <span className="font-bold text-gray-800">Camada ensaiada: </span>
            <span className="text-gray-900">{un.camada_ensaiada_1 || "-"}</span>
          </div>
          <UmidadeTable uData={un} umidMedia={umid1Media} />
        </div>
      ) : (
        (() => {
          const un2 = boletim.umidade_natural_2 || {};
          const u2_1 = calcUmidadeNatural2(un2, 1);
          const u2_2 = calcUmidadeNatural2(un2, 2);
          const umid2Media = calcMediaUmidade(u2_1, u2_2);
          return (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="bg-[#E8EDD5] text-[#00233B] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5">
                  Camada ensaiada: {un.camada_ensaiada_1 || "-"}
                </div>
                <UmidadeTable uData={un} umidMedia={umid1Media} />
              </div>
              <div>
                <div className="bg-[#E8EDD5] text-[#00233B] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5">
                  Camada ensaiada: {un2.camada_ensaiada_1 || "-"}
                </div>
                <UmidadeTable uData={un2} umidMedia={umid2Media} />
              </div>
            </div>
          );
        })()
      )}
    </section>
  );
}