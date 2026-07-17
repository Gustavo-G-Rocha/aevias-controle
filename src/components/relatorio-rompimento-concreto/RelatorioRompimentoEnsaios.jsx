import React from "react";
import { fmtDate, fmtN, agruparEmSeries, resistenciaExemplar } from "@/utils/relatorioRompimentoConcretoUtils";
import EmptyDataCells from "./ensaios/EmptyDataCells";
import TableColGroup from "./ensaios/TableColGroup";

// ── Cabeçalho de seção ──────────────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <div
      style={{ backgroundColor: "#1e293b" }}
      className="text-white text-[10px] font-bold text-center py-0.5 mt-1"
    >
      {label}
    </div>
  );
}

// ── Linhas comuns entre as duas tabelas ─────────────────────────────────────
function RowIdade({ series }) {
  return (
    <tr className="bg-slate-100">
      <td className="border border-slate-400 px-2 py-1 font-semibold">IDADE</td>
      <td className="border border-slate-400 px-2 py-1 font-semibold text-center">UNIDADE</td>
      {series.map((s, si) => (
        <td
          key={si}
          className="border border-slate-400 px-2 py-1 text-center font-bold text-blue-800"
          colSpan={2}
        >
          {s[0]?.idade ? `${s[0].idade} dias` : ""}
        </td>
      ))}
      {series.length === 0 && <EmptyDataCells colSpan={4} />}
    </tr>
  );
}

function RowNumeroCp({ series }) {
  return (
    <tr>
      <td className="border border-slate-400 px-2 py-1 font-semibold">N° CP</td>
      <td className="border border-slate-400 px-2 py-1 text-center"></td>
      {series.map((s, si) =>
        s.map((cp, ci) => (
          <td key={`${si}-${ci}`} className="border border-slate-400 px-2 py-1 text-center font-semibold">
            {cp.numero_cp || ""}
          </td>
        ))
      )}
      {series.length === 0 && <EmptyDataCells count={4} />}
    </tr>
  );
}

function RowDataRuptura({ series }) {
  return (
    <tr>
      <td className="border border-slate-400 px-2 py-1 font-semibold">DATA DA RUPTURA</td>
      <td className="border border-slate-400 px-2 py-1 text-center text-gray-400">-</td>
      {series.map((s, si) =>
        s.map((cp, ci) => (
          <td key={`${si}-${ci}`} className="border border-slate-400 px-2 py-1 text-center">
            {cp.data_ruptura ? fmtDate(cp.data_ruptura) : ""}
          </td>
        ))
      )}
      {series.length === 0 && <EmptyDataCells count={4} />}
    </tr>
  );
}

function RowCargaRuptura({ series, unidade }) {
  return (
    <tr>
      <td className="border border-slate-400 px-2 py-1 font-semibold">CARGA DE RUPTURA</td>
      <td className="border border-slate-400 px-2 py-1 text-center">{unidade}</td>
      {series.map((s, si) =>
        s.map((cp, ci) => (
          <td key={`${si}-${ci}`} className="border border-slate-400 px-2 py-1 text-center">
            {fmtN(cp.carga_ruptura, 2)}
          </td>
        ))
      )}
      {series.length === 0 && <EmptyDataCells count={4} />}
    </tr>
  );
}

function RowResistencia({ series }) {
  return (
    <tr className="bg-slate-50">
      <td className="border border-slate-400 px-2 py-1 font-semibold">RESISTÊNCIA</td>
      <td className="border border-slate-400 px-2 py-1 text-center">MPa</td>
      {series.map((s, si) =>
        s.map((cp, ci) => (
          <td
            key={`res-${si}-${ci}`}
            className="border border-slate-400 px-2 py-1 text-center text-blue-800 font-semibold"
          >
            {fmtN(cp.resistencia, 2)}
          </td>
        ))
      )}
      {series.length === 0 && <EmptyDataCells count={4} />}
    </tr>
  );
}

function RowResistenciaExemplar({ series }) {
  return (
    <tr className="bg-slate-100">
      <td className="border border-slate-400 px-2 py-1 font-semibold">RESIST. DO EXEMPLAR</td>
      <td className="border border-slate-400 px-2 py-1 text-center">MPa</td>
      {series.map((s, si) => (
        <td
          key={si}
          className="border border-slate-400 px-2 py-1 text-center font-bold text-blue-900"
          colSpan={2}
        >
          {resistenciaExemplar(s)}
        </td>
      ))}
      {series.length === 0 && <EmptyDataCells colSpan={4} className="px-1 py-0.5" />}
    </tr>
  );
}

// ── Tabela: Compressão Axial ─────────────────────────────────────────────────
function CompressaoAxialTable({ series, ensaio: _ensaio }) {
  const totalCPs = series.reduce((acc, s) => acc + s.length, 0);
  const totalCpCols = Math.max(series.reduce((a, s) => a + s.length, 0), 1);
  const dimensao = series[0]?.[0]?.dimensao || "";

  return (
    <table
      className="w-full border-collapse border border-slate-400 text-[10px]"
      style={{ tableLayout: "fixed" }}
    >
      <TableColGroup totalCpCols={totalCpCols} />
      <tbody>
        <tr>
          <td className="border border-slate-400 px-2 py-1 font-semibold w-[28%]">N° DE CP'S:</td>
          <td className="border border-slate-400 px-2 py-1 text-center font-bold">{totalCPs || ""}</td>
          <td className="border border-slate-400 px-2 py-1 font-semibold text-center" colSpan={2}>
            DIMENSÕES:
          </td>
          <td
            className="border border-slate-400 px-2 py-1 text-center font-bold text-blue-800"
            colSpan={Math.max(series.length * 2 - 1, 1)}
          >
            {dimensao ? (
              `(${dimensao}) cm`
            ) : (
              <span className="text-gray-400 italic text-[7px]">SELECIONAR (5X10); (15X30); (10X20)</span>
            )}
          </td>
        </tr>
        <RowIdade series={series} />
        <RowNumeroCp series={series} />
        <RowDataRuptura series={series} />
        <RowCargaRuptura series={series} unidade="tf" />
        <tr>
          <td className="border border-slate-400 px-2 py-1 font-semibold">ÁREA DO CORPO DE PROVA</td>
          <td className="border border-slate-400 px-2 py-1 text-center">cm²</td>
          {series.map((s, si) =>
            s.map((cp, ci) => (
              <td key={`${si}-${ci}`} className="border border-slate-400 px-2 py-1 text-center">
                {fmtN(cp.area_cp, 2)}
              </td>
            ))
          )}
          {series.length === 0 && <EmptyDataCells count={4} />}
        </tr>
        <RowResistencia series={series} />
        <RowResistenciaExemplar series={series} />
      </tbody>
    </table>
  );
}

// ── Tabela: Tração na Flexão ─────────────────────────────────────────────────
function TracaoFlexaoTable({ series }) {
  const totalCPs = series.reduce((acc, s) => acc + s.length, 0);
  const totalCpCols = Math.max(series.reduce((a, s) => a + s.length, 0), 1);

  return (
    <table
      className="w-full border-collapse border border-slate-400 text-[10px]"
      style={{ tableLayout: "fixed" }}
    >
      <TableColGroup totalCpCols={totalCpCols} />
      <tbody>
        <tr>
          <td className="border border-slate-400 px-2 py-1 font-semibold w-[28%]">N° DE CP'S:</td>
          <td className="border border-slate-400 px-2 py-1 text-center font-bold">{totalCPs || ""}</td>
          <td className="border border-slate-400 px-2 py-1 font-semibold text-center" colSpan={2}>
            DIMENSÕES:
          </td>
          <td
            className="border border-slate-400 px-2 py-1 text-center font-bold text-blue-800"
            colSpan={Math.max(series.length * 2 - 1, 1)}
          >
            CP PRISMÁTICO
          </td>
        </tr>
        <RowIdade series={series} />
        <RowNumeroCp series={series} />
        <RowDataRuptura series={series} />
        <tr>
          <td className="border border-slate-400 px-2 py-1 font-semibold">PONTO DE RUPTURA</td>
          <td className="border border-slate-400 px-2 py-1 text-center text-gray-400">-</td>
          {series.map((s, si) =>
            s.map((cp, ci) => (
              <td key={`${si}-${ci}`} className="border border-slate-400 px-2 py-1 text-center text-[9px]">
                {cp.ponto_ruptura || ""}
              </td>
            ))
          )}
          {series.length === 0 && <EmptyDataCells count={4} />}
        </tr>
        <RowCargaRuptura series={series} unidade="kgf" />
        <tr>
          <td className="border border-slate-400 px-2 py-1 font-semibold">VÃO CENTRAL DO CP</td>
          <td className="border border-slate-400 px-2 py-1 text-center">mm</td>
          {series.map((s, si) =>
            s.map((cp, ci) => (
              <td key={`vao-${si}-${ci}`} className="border border-slate-400 px-2 py-1 text-center">
                {fmtN(cp.vao_central, 2)}
              </td>
            ))
          )}
          {series.length === 0 && <EmptyDataCells count={4} />}
        </tr>
        <RowResistencia series={series} />
        <RowResistenciaExemplar series={series} />
      </tbody>
    </table>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function RelatorioRompimentoEnsaios({ ensaio }) {
  const seriesCompressao = agruparEmSeries(ensaio.compressao_axial);
  const seriesFlexao = (ensaio.tracao_flexao || []).map((cp) => [cp]);

  return (
    <>
      <div className="mt-4">
        <SectionHeader label="ENSAIO DE RESISTÊNCIA À COMPRESSÃO AXIAL" />
        <div className="overflow-x-auto print:overflow-visible">
          <CompressaoAxialTable series={seriesCompressao} ensaio={ensaio} />
        </div>
      </div>

      <div className="mt-4">
        <SectionHeader label="ENSAIO DE RESISTÊNCIA À TRAÇÃO NA FLEXÃO - ABNT NBR 12142:2010" />
        <div className="overflow-x-auto print:overflow-visible">
          <TracaoFlexaoTable series={seriesFlexao} />
        </div>
      </div>
    </>
  );
}