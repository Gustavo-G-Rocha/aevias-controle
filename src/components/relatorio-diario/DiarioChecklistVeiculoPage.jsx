import React from 'react';

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

function SimNaoNaTable({ title, items, dataPath }) {
  return (
    <table className="w-full border-collapse border border-slate-300 text-xs">
      <thead className="bg-[#f9fafb] text-gray-800">
        <tr>
          <th className="border border-slate-300 p-0.5" colSpan="4">{title}</th>
        </tr>
        <tr className="bg-[#f9fafb]">
          <th className="border border-slate-300 p-0.5"></th>
          <th className="border border-slate-300 p-0.5">Sim</th>
          <th className="border border-slate-300 p-0.5">Não</th>
          <th className="border border-slate-300 p-0.5">N/A</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.key} className="even:bg-gray-50">
            <td className="border border-slate-300 p-0.5">{item.label}</td>
            <td className="border border-slate-300 p-0.5 text-center">{dataPath?.[item.key] === 'sim' && '☑'}</td>
            <td className="border border-slate-300 p-0.5 text-center">{dataPath?.[item.key] === 'nao' && '☑'}</td>
            <td className="border border-slate-300 p-0.5 text-center">{dataPath?.[item.key] === 'na' && '☑'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LuzesTable({ title, grupos }) {
  return (
    <table className="w-full border-collapse border border-slate-300 text-xs">
      <thead className="bg-[#f9fafb] text-gray-800">
        <tr><th className="border border-slate-300 p-0.5" colSpan="4">{title}</th></tr>
        <tr className="bg-[#f9fafb]">
          <th className="border border-slate-300 p-0.5"></th>
          <th className="border border-slate-300 p-0.5">Sim</th>
          <th className="border border-slate-300 p-0.5">Não</th>
          <th className="border border-slate-300 p-0.5">N/A</th>
        </tr>
      </thead>
      <tbody>
        {grupos.map(({ lado, items, data }) => (
          <React.Fragment key={lado}>
            <tr className="bg-[#f9fafb] text-gray-800 font-semibold">
              <td className="border border-slate-300 p-0.5" colSpan="4">{lado}</td>
            </tr>
            {items.map(item => (
              <tr key={item.key} className="even:bg-gray-50">
                <td className="border border-slate-300 p-0.5">{item.label}</td>
                <td className="border border-slate-300 p-0.5 text-center">{data?.[item.key] === 'sim' && '☑'}</td>
                <td className="border border-slate-300 p-0.5 text-center">{data?.[item.key] === 'nao' && '☑'}</td>
                <td className="border border-slate-300 p-0.5 text-center">{data?.[item.key] === 'na' && '☑'}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

const TRASEIRAS_GRUPOS = [
  {
    lado: 'Direita',
    items: [
      { key: 'da_placa', label: 'Da placa' },
      { key: 'luz', label: 'Luz' },
      { key: 'luz_re', label: 'Luz de ré' },
      { key: 'luz_freio', label: 'Luz de freio' },
      { key: 'seta', label: 'Seta' },
    ],
    dataKey: 'direita',
  },
  {
    lado: 'Esquerda',
    items: [
      { key: 'luz', label: 'Luz' },
      { key: 'luz_re', label: 'Luz de ré' },
      { key: 'luz_freio', label: 'Luz de freio' },
      { key: 'seta', label: 'Seta' },
    ],
    dataKey: 'esquerda',
  },
];

const DIANTEIRAS_GRUPOS = [
  {
    lado: 'Direita',
    items: [
      { key: 'farol_alto', label: 'Farol alto' },
      { key: 'farol_baixo', label: 'Farol baixo' },
      { key: 'seta', label: 'Seta' },
      { key: 'neblina', label: 'Neblina' },
    ],
    dataKey: 'direita',
  },
  {
    lado: 'Esquerda',
    items: [
      { key: 'farol_alto', label: 'Farol alto' },
      { key: 'farol_baixo', label: 'Farol baixo' },
      { key: 'seta', label: 'Seta' },
      { key: 'neblina', label: 'Neblina' },
    ],
    dataKey: 'esquerda',
  },
];

const SEGURANCA_ITEMS = [
  { key: 'alarme', label: 'Alarme' }, { key: 'buzina', label: 'Buzina' },
  { key: 'chave_roda', label: 'Chave de Roda' }, { key: 'cintos', label: 'Cintos' },
  { key: 'documentos', label: 'Documentos' }, { key: 'extintor', label: 'Extintor' },
  { key: 'limpadores', label: 'Limpadores' }, { key: 'macaco', label: 'Macaco' },
  { key: 'painel', label: 'Painel' }, { key: 'retrovisor_interno', label: 'Retrovisor Interno' },
  { key: 'retrovisor_direito', label: 'Retrovisor Direito' }, { key: 'retrovisor_esquerdo', label: 'Retrovisor Esquerdo' },
  { key: 'travas', label: 'Travas' }, { key: 'triangulo', label: 'Triângulo' },
];

const MOTOR_ITEMS = [
  { key: 'acelerador', label: 'Acelerador' }, { key: 'agua_limpador', label: 'Água do limpador' },
  { key: 'agua_radiador', label: 'Água do radiador' }, { key: 'embreagem', label: 'Embreagem' },
  { key: 'freio', label: 'Freio' }, { key: 'freio_mao', label: 'Freio de mão' },
  { key: 'oleo_freio', label: 'Óleo do freio' }, { key: 'oleo_moto', label: 'Óleo do moto' },
  { key: 'tanque_partida', label: 'Tanque de partida' },
];

export default function DiarioChecklistVeiculoPage({ diario, obra, regional, formatDate }) {
  const cv = diario.checklist_veiculo;
  const tipoVeiculo = cv?.tipo_veiculo || 'passeio';
  const tituloVeiculo = tipoVeiculo === 'picape' ? 'Picape' : 'Veículo de Passeio';

  const condicoesGeraisItems = [
    { key: 'limpeza_externa', label: 'Limpeza Externa' },
    { key: 'limpeza_interna', label: 'Limpeza Interna' },
    { key: 'pneus', label: 'Pneus' },
    { key: 'estepe', label: 'Estepe' },
    ...(tipoVeiculo === 'picape' ? [{ key: 'cacamba', label: 'Caçamba' }] : []),
  ];

  return (
    <div className="break-before-page p-3 print:p-3">
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1.5 mb-2">
        <div className="flex justify-start">
          <picture>
            <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
            <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-base font-bold text-gray-800">Checklist de {tituloVeiculo}</h1>
          <p className="text-xs text-gray-600">Obra: {obra?.name || 'N/A'}</p>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 p-1.5 rounded-md text-xs bg-white">
            <p className="font-semibold text-gray-800">{formatDate(diario.data)}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-x-3.5 gap-y-1 mb-3 text-sm">
        <div><span className="font-bold">Nome: </span><span>{cv?.nome_condutor || 'N/A'}</span></div>
        <div><span className="font-bold">Empresa: </span><span>{cv?.empresa || 'N/A'}</span></div>
        <div><span className="font-bold">Veículo: </span><span>{cv?.veiculo || 'N/A'}</span></div>
        <div><span className="font-bold">Placa: </span><span>{cv?.placa || 'N/A'}</span></div>
        <div className="col-span-2"><span className="font-bold">Hodômetro: </span><span>{cv?.hodometro || 'N/A'}</span></div>
      </div>

      {cv?.areas_afetadas && (
        <div className="mb-2 p-1 bg-yellow-50 border border-yellow-300 rounded text-sm">
          <p className="font-bold text-yellow-800">Áreas Afetadas:</p>
          <p className="text-gray-700">{cv.areas_afetadas}</p>
        </div>
      )}

      {/* Condições Gerais */}
      <table className="w-full border-collapse border border-slate-300 mb-2 text-xs">
        <thead className="bg-[#f9fafb] text-gray-800">
          <tr><th className="border border-slate-300 p-0.5" colSpan="4">Condições Gerais</th></tr>
          <tr className="bg-[#f9fafb]">
            <th className="border border-slate-300 p-0.5">Item</th>
            <th className="border border-slate-300 p-0.5">Bom</th>
            <th className="border border-slate-300 p-0.5">Médio</th>
            <th className="border border-slate-300 p-0.5">Ruim</th>
          </tr>
        </thead>
        <tbody>
          {condicoesGeraisItems.map(item => (
            <tr key={item.key} className="even:bg-gray-50">
              <td className="border border-slate-300 p-0.5">{item.label}</td>
              <td className="border border-slate-300 p-0.5 text-center">{cv?.condicoes_gerais?.[item.key] === 'bom' && '☑'}</td>
              <td className="border border-slate-300 p-0.5 text-center">{cv?.condicoes_gerais?.[item.key] === 'medio' && '☑'}</td>
              <td className="border border-slate-300 p-0.5 text-center">{cv?.condicoes_gerais?.[item.key] === 'ruim' && '☑'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Luzes */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <LuzesTable
          title="Luzes Traseiras"
          grupos={TRASEIRAS_GRUPOS.map(g => ({ ...g, data: cv?.luzes_traseiras?.[g.dataKey] }))}
        />
        <LuzesTable
          title="Luzes Dianteiras"
          grupos={DIANTEIRAS_GRUPOS.map(g => ({ ...g, data: cv?.luzes_dianteiras?.[g.dataKey] }))}
        />
      </div>

      {/* Segurança e Motor */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <SimNaoNaTable title="Segurança" items={SEGURANCA_ITEMS} dataPath={cv?.seguranca} />
        <SimNaoNaTable title="Motor" items={MOTOR_ITEMS} dataPath={cv?.motor} />
      </div>

      {cv?.observacoes && (
        <div className="mt-2">
          <p className="font-bold text-sm mb-0.5">Observações:</p>
          <div className="border border-slate-300 p-1 min-h-[35px] text-xs bg-gray-50">
            {cv.observacoes}
          </div>
        </div>
      )}
    </div>
  );
}