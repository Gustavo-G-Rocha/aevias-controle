import React from "react";
import { fmtNum } from "@/utils/relatorioBoletimSondagemUtils";

function CamadasTableHead() {
  return (
    <thead>
      <tr className="bg-[#E8EDD5]">
        <th rowSpan={2} className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">Nº</th>
        <th colSpan={2} className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">PROF. (m)</th>
        <th rowSpan={2} className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">ESP.</th>
        <th rowSpan={2} className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">N.A</th>
        <th rowSpan={2} className="border border-[#BFCF99] px-1 py-0.5 text-center font-bold">CLASSIFICAÇÃO</th>
      </tr>
      <tr className="bg-[#E8EDD5]">
        <th className="border border-[#BFCF99] px-1 py-0.5 text-center text-[8px]">DE</th>
        <th className="border border-[#BFCF99] px-1 py-0.5 text-center text-[8px]">ATÉ</th>
      </tr>
    </thead>
  );
}

function CamadasTableBody({ camadas, classField }) {
  return (
    <tbody>
      {camadas.map((c, i) => (
        <tr key={i} className={"bg-white"}>
          <td className="border border-[#BFCF99] px-1 py-0.5 text-center font-semibold">{c.numero}</td>
          <td className="border border-[#BFCF99] px-1 py-0.5 text-center">{c.prof_de != null ? fmtNum(c.prof_de) : "-"}</td>
          <td className="border border-[#BFCF99] px-1 py-0.5 text-center">{c.prof_ate != null ? fmtNum(c.prof_ate) : "-"}</td>
          <td className="border border-[#BFCF99] px-1 py-0.5 text-center">{c.espessura != null ? fmtNum(c.espessura) : "-"}</td>
          <td className="border border-[#BFCF99] px-1 py-0.5 text-center">{c.na != null ? fmtNum(c.na) : "-"}</td>
          <td className="border border-[#BFCF99] px-1 py-0.5">{c[classField] || ""}</td>
        </tr>
      ))}
    </tbody>
  );
}

export default function BoletimSondagemCamadas({ boletim, temCol2 }) {
  const camadas = boletim.camadas || [];

  return (
    <section>
      <div className="bg-[#BFCF99] text-[#00233B] px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        SONDAGEM — CAMADAS
      </div>

      {!temCol2 ? (
        <div>
          <div className="bg-[#E8EDD5] text-[#00233B] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5">
            {boletim.face_classificacao_1 ? `Face: ${boletim.face_classificacao_1}` : "Classificação 1"}
          </div>
          <table className="w-full border-collapse border border-[#BFCF99] text-[9px]">
            <CamadasTableHead />
            <CamadasTableBody camadas={camadas} classField="classificacao_1" />
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="bg-[#E8EDD5] text-[#00233B] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5">
              {boletim.face_classificacao_1 ? `Face: ${boletim.face_classificacao_1}` : "Classificação 1"}
            </div>
            <table className="w-full border-collapse border border-[#BFCF99] text-[9px]">
              <CamadasTableHead />
              <CamadasTableBody camadas={camadas} classField="classificacao_1" />
            </table>
          </div>
          <div>
            <div className="bg-[#E8EDD5] text-[#00233B] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5">
              {boletim.face_classificacao_2 ? `Face: ${boletim.face_classificacao_2}` : "Classificação 2"}
            </div>
            <table className="w-full border-collapse border border-[#BFCF99] text-[9px]">
              <CamadasTableHead />
              <CamadasTableBody
                camadas={boletim.camadas_2?.length ? boletim.camadas_2 : camadas}
                classField="classificacao_2"
              />
            </table>
          </div>
        </div>
      )}
    </section>
  );
}