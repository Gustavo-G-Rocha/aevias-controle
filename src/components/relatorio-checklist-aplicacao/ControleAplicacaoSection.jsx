import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import CheckmarkColumn from './CheckmarkColumn';

export default function ControleAplicacaoSection({ controle_aplicacao, observacoes_gerais }) {
  const ca = controle_aplicacao || {};

  return (
    <>
      <ReportSectionTitle>Controle de Aplicação</ReportSectionTitle>
      <div className="grid grid-cols-2 gap-1 mb-0.5" style={{ fontSize: '10px' }}>
        <div>
          <p><strong>km/estaca inicial:</strong> {ca.km_estaca_inicial || '-'}</p>
          <p><strong>Lado:</strong> {ca.lado_inicial || '-'}</p>
        </div>
        <div>
          <p><strong>Quantidade aplicada (cargas):</strong> {ca.quantidade_aplicada_cargas || '-'}</p>
        </div>
        <div>
          <p><strong>km/estaca final:</strong> {ca.km_estaca_final || '-'}</p>
          <p><strong>Lado:</strong> {ca.lado_final || '-'}</p>
        </div>
        <div>
          <p><strong>Quantidade aplicada (t):</strong> {ca.quantidade_aplicada_toneladas || '-'}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '10px' }}>
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-300 p-0.5 text-left font-medium">Ensaio</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Sim</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Não</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Qtde</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-20">Frequência</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-24">Limite</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Sim</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium w-10">Não</th>
            <th className="border border-slate-300 p-0.5 text-left font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 p-0.5">Temp. de aplicação das cargas:</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.temp_aplicacao_cargas?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.temp_aplicacao_cargas?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">{ca.temp_aplicacao_cargas?.quantidade || '-'}</td>
            <td className="border border-slate-300 p-0.5 text-center" style={{ fontSize: '8px' }}>2 por carga</td>
            <td className="border border-slate-300 p-0.5 text-center" style={{ fontSize: '8px' }}>Estabelecida em projeto</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.temp_aplicacao_cargas?.conforme} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.temp_aplicacao_cargas?.conforme} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5" rowSpan="2" style={{ fontSize: '8px' }}>
              {ca.observacoes || '-'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-0.5">Espessura da camada:</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.espessura_camada?.realizado} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.espessura_camada?.realizado} isYesColumn={false} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">{ca.espessura_camada?.quantidade || '-'}</td>
            <td className="border border-slate-300 p-0.5 text-center" style={{ fontSize: '8px' }}>Para cada carga aplicada</td>
            <td className="border border-slate-300 p-0.5 text-center" style={{ fontSize: '8px' }}>Estabelecida em projeto</td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.espessura_camada?.conforme} isYesColumn={true} />
            </td>
            <td className="border border-slate-300 p-0.5 text-center">
              <CheckmarkColumn value={ca.espessura_camada?.conforme} isYesColumn={false} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-0.5 mb-0.5">
        <strong className="font-medium" style={{ fontSize: '10px' }}>Observações Gerais:</strong>
        <p style={{ fontSize: '8px' }}>{observacoes_gerais || 'Nenhuma observação adicional.'}</p>
      </div>
    </>
  );
}