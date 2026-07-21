import React from "react";
import { fmtNum, calcUmidadeNatural2, calcMediaUmidade } from "@/utils/relatorioBoletimSondagemUtils";

const SECTION_BAND =
  "bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1";
const SUB_BAND =
  "bg-[#f1f5f9] text-[#00233B] border border-[#94a3b8] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5";
const TABLE = "w-full border-collapse border border-[#94a3b8] text-[9px]";
const TH = "border border-[#94a3b8] bg-[#f1f5f9] px-1 py-1.5 font-bold text-[#00233B]";
const TD = "border border-[#94a3b8] px-1 py-1.5 text-[#00233B]";

function UmidadeTable({ uData, umidMedia }) {
  const rows = [
    ["Nº cápsula", uData.no_capsula_1, uData.no_capsula_2, false],
    ["Massa cápsula (g)", uData.massa_capsula_1, uData.massa_capsula_2, true],
    ["Massa cap + solo úmido (g)", uData.massa_cap_solo_umido_1, uData.massa_cap_solo_umido_2, true],
    ["Massa cap + solo seco (g)", uData.massa_cap_solo_seco_1, uData.massa_cap_solo_seco_2, true],
  ];

  return (
    <table className={TABLE}>
      <thead>
        <tr>
          <th className={TH + " text-left"}>Campo</th>
          <th className={TH}>Am. 1</th>
          <th className={TH}>Am. 2</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, v1, v2, isNum], ri) => (
          <tr key={ri} className="bg-white">
            <td className={TD + " text-left"}>{label}</td>
            <td className={TD + " text-center"}>{isNum ? fmtNum(v1) : v1 || "-"}</td>
            <td className={TD + " text-center"}>{isNum ? fmtNum(v2) : v2 || "-"}</td>
          </tr>
        ))}
        <tr className="bg-[#f1f5f9]">
          <td className={TD + " text-left font-bold"}>Umidade (%)</td>
          <td className={TD + " text-center font-bold text-[#00233B]"} colSpan={2}>
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
      <div className={SECTION_BAND}>Umidade Natural — DNER-ME 213/94</div>

      {!boletim.umidade_natural_2 ? (
        <div>
          <div className="bg-white border border-[#94a3b8] px-1 py-0.5 text-[9px] mb-0.5">
            <span className="font-bold text-[#00233B]">Camada ensaiada: </span>
            <span className="text-[#00233B]">{un.camada_ensaiada_1 || "-"}</span>
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
                <div className={SUB_BAND}>
                  Camada ensaiada: {un.camada_ensaiada_1 || "-"}
                </div>
                <UmidadeTable uData={un} umidMedia={umid1Media} />
              </div>
              <div>
                <div className={SUB_BAND}>
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