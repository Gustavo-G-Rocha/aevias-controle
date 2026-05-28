import React from 'react';

const BORDER_COLOR = 'hsl(212.73deg 26.83% 83.92%)';
const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

const MAQUINAS_ROWS = [
  ['Motoniveladora', 'motoniveladora', 'Caminhão Espargidor', 'caminhao_espargidor'],
  ['Pá Carregadeira', 'pa_carregadeira', 'Recicladora', 'recicladora'],
  ['Retroescavadeira', 'retroescavadeira', 'Vibro Acabadora', 'vibro_acabadora'],
  ['Escavadeira Hidráulica', 'escavadeira_hidraulica', 'Rolo Carneiro', 'rolo_carneiro'],
  ['Mini Carregadeira', 'mini_carregadeira', 'Rolo Liso', 'rolo_liso'],
  ['Extrusora', 'extrusora', 'Rolo Pneu', 'rolo_pneu'],
  ['Caminhão Prancha', 'caminhao_prancha', 'Tanque Combustível', 'tanque_combustivel'],
  ['Caminhão Munck', 'caminhao_munck', 'Comboio', 'comboio'],
  ['Caminhão Sinalização', 'caminhao_sinalizacao', 'Ônibus', 'onibus'],
  ['Caminhão Pipa', 'caminhao_pipa', 'Trator de Grade', 'trator_grade'],
  ['Caminhão Basculante', 'caminhao_basculante', 'Trator de Esteira', 'trator_esteira'],
  ['Caminhão Cimento', 'caminhao_cimento', 'Veículo Leve', 'veiculo_leve'],
  ['Caminhão Viga', 'caminhao_viga', 'Placa Vibratória', 'placa_vibratoria'],
];

const COLABORADORES_ROWS = [
  ['Encarregado', 'encarregado', 'Topógrafo', 'topografo'],
  ['Greidista', 'greidista', 'Aux. Topografia', 'aux_topografia'],
  ['Operadores', 'operadores', 'Laboratorista', 'laboratorista'],
  ['Motorista', 'motorista', 'Aux. Laboratório', 'aux_laboratorio'],
  ['Pedreiro', 'pedreiro', 'Spoter', 'spoter'],
  ['Armador', 'armador', 'Segurança', 'seguranca'],
  ['Carpinteiro', 'carpinteiro', 'Apontador', 'apontador'],
  ['Ajudante', 'ajudante', 'Pintor', 'pintor'],
  ['Eletricista', 'eletricista', '', ''],
];

function EfetivoTable({ title, rows, data }) {
  return (
    <table className="w-full border-collapse mb-6 text-sm" style={{ borderColor: BORDER_COLOR }} border="1">
      <thead>
        <tr className="bg-gray-50">
          <th className="border p-2 text-center font-bold" style={{ borderColor: BORDER_COLOR }} colSpan="4">{title}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="even:bg-gray-50/50">
            {[0, 2].map(i => (
              <React.Fragment key={i}>
                <td className="border p-1.5 px-3 font-semibold w-[35%]" style={{ borderColor: BORDER_COLOR }}>{row[i]}</td>
                <td className="border p-1.5 px-3 text-center w-[15%]" style={{ borderColor: BORDER_COLOR }}>
                  {row[i + 1] ? (data?.[row[i + 1]] || '') : ''}
                </td>
              </React.Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DiarioEfetivoPage({ diario, obra, regional, clienteDisplay }) {
  return (
    <div className="break-before-page p-8 print:p-8 min-h-[29.7cm] flex flex-col">
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-start">
          <picture>
            <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
            <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Efetivo de Obra</h1>
          <p className="text-md text-slate-700">{obra?.name || 'N/A'}</p>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 p-2 rounded-md bg-white">
            <p className="text-sm font-semibold text-gray-800">
              {new Date(diario.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-3">
        <h2 className="text-xs font-bold text-gray-800 mb-2">INFORMAÇÕES GERAIS</h2>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase">Cliente</p>
              <p className="text-gray-800 font-medium">{clienteDisplay}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase">Obra</p>
              <p className="text-gray-800 font-medium">{obra?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase">Trecho</p>
              <p className="text-gray-800 font-medium">{diario.trecho || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase">Rodovia</p>
              <p className="text-gray-800 font-medium">{diario.rodovia || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase">Empreiteira</p>
              <p className="text-gray-800 font-medium">{diario.empreiteira || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase">Laboratorista</p>
              <p className="text-gray-800 font-medium">{diario.laboratorista_name || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <EfetivoTable title="EFETIVO DE MÁQUINAS OPERANTES" rows={MAQUINAS_ROWS} data={diario.efetivo_maquinas} />
      <EfetivoTable title="EFETIVO DE COLABORADORES" rows={COLABORADORES_ROWS} data={diario.efetivo_colaboradores} />
    </div>
  );
}