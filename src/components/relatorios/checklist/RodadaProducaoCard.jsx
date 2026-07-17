import React from 'react';
import { ReportCheckmark } from '../shared';

const Checkmark = ({ checked }) => <ReportCheckmark checked={checked} />;

/**
 * Card de rodada de produção
 */
export default function RodadaProducaoCard({ rodada, index: _index }) {
  return (
    <div className="border border-slate-200 p-2 rounded-md space-y-1 text-sm">
      <h3 className="font-bold text-center">Rodada {rodada.numero_rodada}</h3>
      <p><strong className="font-medium">Horário:</strong> {rodada.horario_inicio} às {rodada.horario_termino}</p>
      <p><strong className="font-medium">Temp. Ambiente:</strong> {rodada.temperatura_ambiente}°C</p>
      <p><strong className="font-medium">Clima:</strong> {rodada.condicoes_climaticas}</p>
      <p><strong className="font-medium">Qtde. Produzida:</strong> {rodada.quantidade_produzida} t</p>
      <p><strong className="font-medium">Controle de Cargas (Qtde):</strong> {rodada.controle_cargas_qtde}</p>
      <p><strong className="font-medium">Caminhões Enlonados:</strong> <Checkmark checked={rodada.caminhoes_enlonados} /></p>
      <p><strong className="font-medium">Temp. Massa:</strong> T1: {rodada.temperatura_massa_t1}°C / T2: {rodada.temperatura_massa_t2}°C</p>
    </div>
  );
}