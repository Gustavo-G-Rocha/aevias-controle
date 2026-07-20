import React from "react";
import { fmtNum } from "@/utils/relatorioBoletimSondagemUtils";

const SECTION_BAND =
  "bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1";
const SUB_BAND =
  "bg-[#f1f5f9] text-[#00233B] border border-[#94a3b8] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5";
const TABLE = "w-full border-collapse border border-[#94a3b8] text-[9px]";
const TH = "border border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 text-center font-bold text-[#00233B]";
const TD = "border border-[#94a3b8] px-1 py-0.5 text-center text-[#00233B]";

function CamadasTableHead() {
  return (
    <thead>
      <tr>
        <th rowSpan={2} className={TH}>Nº</th>
        <th colSpan={2} className={TH}>PROF. (m)</th>
        <th rowSpan={2} className={TH}>ESP.</th>
        <th rowSpan={2} className={TH}>N.A</th>
        <th rowSpan={2} className={TH}>CLASSIFICAÇÃO</th>
      </tr>
      <tr>
        <th className={TH + " text-[8px]"}>DE</th>
        <th className={TH + " text-[8px]"}>ATÉ</th>
      </tr>
    </thead>
  );
}

function CamadasTableBody({ camadas, classField }) {
  return (
    <tbody>
      {camadas.map((c, i) => (
        <tr key={i} className="bg-white">
          <td className={TD + " font-semibold"}>{c.numero}</td>
          <td className={TD}>{c.prof_de != null ? fmtNum(c.prof_de) : "-"}</td>
          <td className={TD}>{c.prof_ate != null ? fmtNum(c.prof_ate) : "-"}</td>
          <td className={TD}>{c.espessura != null ? fmtNum(c.espessura) : "-"}</td>
          <td className={TD}>{c.na != null ? fmtNum(c.na) : "-"}</td>
          <td className={TD + " text-left"}>{c[classField] || ""}</td>
        </tr>
      ))}
    </tbody>
  );
}

export default function BoletimSondagemCamadas({ boletim, temCol2 }) {
  const camadas = boletim.camadas || [];

  return (
    <section>
      <div className={SECTION_BAND}>Sondagem — Camadas</div>

      {!temCol2 ? (
        <div>
          <div className={SUB_BAND}>
            {boletim.face_classificacao_1 ? `Face: ${boletim.face_classificacao_1}` : "Classificação 1"}
          </div>
          <table className={TABLE}>
            <CamadasTableHead />
            <CamadasTableBody camadas={camadas} classField="classificacao_1" />
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={SUB_BAND}>
              {boletim.face_classificacao_1 ? `Face: ${boletim.face_classificacao_1}` : "Classificação 1"}
            </div>
            <table className={TABLE}>
              <CamadasTableHead />
              <CamadasTableBody camadas={camadas} classField="classificacao_1" />
            </table>
          </div>
          <div>
            <div className={SUB_BAND}>
              {boletim.face_classificacao_2 ? `Face: ${boletim.face_classificacao_2}` : "Classificação 2"}
            </div>
            <table className={TABLE}>
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