import React from 'react';
import CellsCP from './CellsCP';
import {
  temDadosRTCD,
  temDadosEstabilidade,
  extrairConstPrensa,
  estáAbaixoMin,
  estáForaDaFaixaMinMax,
  fmtNum,
} from '@/utils/relatorioCAUQTabelasUtils';

/**
 * Extrai do IIFE (linhas 300-396) — renderiza seção RTCD/Estabilidade
 * com const_prensa compartilhada, leitura, valor/corrigida, fluência, etc.
 */
export default function MarshallSecaoRTCDEstabilidade({
  cpsValidos,
  media,
  project,
}) {
  const temDiametral = temDadosRTCD(cpsValidos);
  const temEstabilidade = temDadosEstabilidade(cpsValidos);
  const constPrensa = extrairConstPrensa(cpsValidos);

  const rowConstPrensa = (
    <tr className="bg-white">
      <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">CONST. PRENSA</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
      <td colSpan="6" className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">
        {constPrensa}
      </td>
      <td className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">-</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
    </tr>
  );

  if (!temDiametral && !temEstabilidade) return null;

  return (
    <>
      {temDiametral && (
        <>
          {rowConstPrensa}
          <tr className="bg-slate-50">
            <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">LEITURA</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">Kgf/cm²</td>
            <CellsCP cpsValidos={cpsValidos} campo="rtcd_leitura" />
            <td className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
          </tr>
          <tr className="bg-white">
            <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">RTCD</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">MPa</td>
            <CellsCP cpsValidos={cpsValidos} campo="rtcd_valor" bold />
            <td
              className={`border border-slate-400 px-0 py-0 text-center font-bold text-[7px] ${
                project?.rtcd && media('rtcd_valor') !== '-' && estáAbaixoMin(media('rtcd_valor'), project.rtcd.min)
                  ? 'text-red-600'
                  : ''
              }`}
            >
              {media('rtcd_valor')}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">
              {project?.rtcd?.min ? fmtNum(project.rtcd.min, 1) : '-'}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
          </tr>
        </>
      )}

      {temEstabilidade && (
        <>
          {!temDiametral && rowConstPrensa}
          <tr className="bg-slate-50">
            <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">LEITURA</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">Kgf/cm²</td>
            <CellsCP cpsValidos={cpsValidos} campo="estabilidade_leitura" />
            <td className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
          </tr>
          <tr className="bg-white">
            <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">ESTABILIDADE CORRIG.</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">Kgf/cm²</td>
            <CellsCP cpsValidos={cpsValidos} campo="estabilidade_corrigida" bold />
            <td
              className={`border border-slate-400 px-0 py-0 text-center font-bold text-[7px] ${
                project?.estabilidade &&
                media('estabilidade_corrigida') !== '-' &&
                estáAbaixoMin(media('estabilidade_corrigida'), project.estabilidade.min)
                  ? 'text-red-600'
                  : ''
              }`}
            >
              {media('estabilidade_corrigida')}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">
              {project?.estabilidade?.projeto ? fmtNum(project.estabilidade.projeto, 1) : '-'}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">
              {project?.estabilidade?.min ? fmtNum(project.estabilidade.min, 1) : '-'}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
          </tr>
          <tr className="bg-slate-50">
            <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">FLUÊNCIA</td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">mm</td>
            <CellsCP cpsValidos={cpsValidos} campo="fluencia" bold />
            <td
              className={`border border-slate-400 px-0 py-0 text-center font-bold text-[7px] ${
                project?.fluencia &&
                media('fluencia') !== '-' &&
                estáForaDaFaixaMinMax(media('fluencia'), project.fluencia.min, project.fluencia.max)
                  ? 'text-red-600'
                  : ''
              }`}
            >
              {media('fluencia')}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">
              {project?.fluencia?.projeto ? fmtNum(project.fluencia.projeto, 1) : '-'}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">
              {project?.fluencia?.min ? fmtNum(project.fluencia.min, 1) : '-'}
            </td>
            <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">
              {project?.fluencia?.max ? fmtNum(project.fluencia.max, 1) : '-'}
            </td>
          </tr>
        </>
      )}
    </>
  );
}