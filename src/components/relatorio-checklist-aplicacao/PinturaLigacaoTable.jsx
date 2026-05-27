import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import CheckmarkColumn from './CheckmarkColumn';
import { formatConformidade } from '@/utils/relatorioChecklistAplicacaoUtils';

export default function PinturaLigacaoTable({ pintura_ligacao }) {
  const pl = pintura_ligacao || {};

  return (
    <>
      <ReportSectionTitle>Acompanhamento da Pintura de Ligação</ReportSectionTitle>
      <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '10px' }}>
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-300 p-0.5 text-left font-medium">Serviço</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Sim</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Não</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-16">Resultado</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-20">Conformidade</th>
            <th className="border border-slate-300 p-0.5 text-left font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 p-0.5">Pintura realizada na barra espargidora?</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.pintura_barra_espargidora?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.pintura_barra_espargidora?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">-</td>
            <td className="border border-slate-300 p-0.5 text-center">NA</td>
            <td className="border border-slate-300 p-0.5" rowSpan="5" style={{ fontSize: '8px' }}>
              {pl.observacoes || '-'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">Aguardado tempo necessário para rompimento/cura?</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.tempo_rompimento_cura?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.tempo_rompimento_cura?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">-</td>
            <td className="border border-slate-300 p-0.5 text-center">NA</td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">Taxa de Pintura:</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.taxa_pintura?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.taxa_pintura?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">{pl.taxa_pintura?.resultado || '-'}</td>
            <td className="border border-slate-300 p-0.5 text-center">{formatConformidade(pl.taxa_pintura?.conforme)}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">Resíduo da Emulsão:</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.residuo_emulsao?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.residuo_emulsao?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">{pl.residuo_emulsao?.resultado || '-'}</td>
            <td className="border border-slate-300 p-0.5 text-center">-</td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">Taxa de Pintura Residual:</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.taxa_pintura_residual?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={pl.taxa_pintura_residual?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">{pl.taxa_pintura_residual?.resultado || '-'}</td>
            <td className="border border-slate-300 p-0.5 text-center">{formatConformidade(pl.taxa_pintura_residual?.conforme)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}