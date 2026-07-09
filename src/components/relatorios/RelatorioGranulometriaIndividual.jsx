import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PENEIRAS_MAP } from '@/constants/sieves';
import { formatDate, buildSignatureProps } from '@/utils/relatorioUtils';
import SignatureFooter from './SignatureFooter';
import PrintStyles from './PrintStyles';

export default function RelatorioGranulometriaIndividual({ ensaio, obra, project, user, regional }) {
  if (!ensaio) {
    return (
      <div className="bg-white p-8 font-sans">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-4">Erro</h2>
          <p>Dados do ensaio não foram fornecidos.</p>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    window.print();
  };

  // Peneiras ordenadas do maior para o menor mm (ordem granulométrica correta)
  const peneirasOrdenadas = Object.keys(PENEIRAS_MAP).sort((a, b) => {
    const mmA = parseFloat(PENEIRAS_MAP[a].mm.replace(',', '.'));
    const mmB = parseFloat(PENEIRAS_MAP[b].mm.replace(',', '.'));
    return mmB - mmA;
  });

  const peneirasVisiveis = project?.faixa_trabalho 
    ? peneirasOrdenadas.filter(key => project.faixa_trabalho[key] !== null && project.faixa_trabalho[key] !== undefined)
    : peneirasOrdenadas;

  // Prepare data for chart — sorted ascending by mm for log scale
  const chartData = peneirasVisiveis.map(pKey => {
    const pInfo = PENEIRAS_MAP[pKey];
    const mmValue = parseFloat(pInfo.mm.replace(',', '.'));
    const dataPoint = { mm: mmValue, astm: pInfo.astm };
    ensaio.agregados?.forEach((agg, idx) => {
      dataPoint[`Agregado ${idx + 1}`] = parseFloat(agg.granulometria?.[pKey]?.passante) || 0;
    });
    return dataPoint;
  }).sort((a, b) => a.mm - b.mm);

  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 15mm 12mm !important; }
          body { margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          #report-content {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 6mm 5mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
        {/* Conteúdo Principal */}
        <div id="report-content" className="bg-white font-sans p-8 max-w-6xl mx-auto">
      {/* Cabeçalho com Logo e Data */}
      <header className="flex items-center justify-between border-b-4 border-slate-700 pb-4 mb-6">
        <div className="w-1/4">
          <picture><source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} /><img src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" /></picture>
        </div>
        <div className="w-1/2 text-center">
          <h1 className="text-lg font-bold text-gray-800 uppercase">Granulometria Individual</h1>
          <h2 className="text-sm text-gray-700">{obra?.name}</h2>
          <p className="text-xs text-slate-600">Ensaio de Granulometria do Agregado</p>
        </div>
        <div className="w-1/4 flex justify-end">
          <div className="border border-gray-300 rounded-lg px-3 py-1 bg-white shadow-sm">
            <p className="text-gray-700 text-sm font-semibold">{formatDate(ensaio.data_ensaio)}</p>
          </div>
        </div>
      </header>

      {/* Informações da Obra e Amostra */}
      <section className="mt-6 grid grid-cols-3 gap-6 text-sm mb-4">
        <div className="space-y-1">
          <p className="font-semibold">Obra:</p>
          <p>{obra?.name} - {obra?.code}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Projeto:</p>
          <p>{project?.name || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Data:</p>
          <p>{formatDate(ensaio.data_ensaio)}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Rodovia:</p>
          <p>{ensaio.rodovia || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Laboratorista:</p>
          <p>{ensaio.laboratorista_name || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Local de Coleta:</p>
          <p>{ensaio.local_coleta || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Faixa:</p>
          <p>{ensaio.faixa || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Pedreira:</p>
          <p>{ensaio.pedreira || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Horário:</p>
          <p>{ensaio.horario || 'N/A'}</p>
        </div>
      </section>
      <hr className="border-t-2 border-slate-300 my-4" />

      {/* Granulometria */}
      <section className="mb-4">
       <p className="text-xs text-center font-bold mb-2">MÉTODO DE ENSAIO DE GRANULOMETRIA - DNIT 412/2025-ME</p>

        {/* Tabela Compacta de Granulometria */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-gray-400 text-xs">
            <thead className="bg-slate-700 text-gray-800">
              <tr>
                <th className="border border-gray-400 p-1 text-white" style={{ backgroundColor: '#334155' }} rowSpan="2">PENEIRA</th>
                <th className="border border-gray-400 p-1 text-white" style={{ backgroundColor: '#334155' }} rowSpan="2">mm</th>
                {ensaio.agregados?.map((agg, idx) => (
                  <th key={idx} className="border border-gray-400 p-1 bg-slate-700 text-white" colSpan="2">{agg.nome || `Agg ${idx + 1}`}</th>
                ))}
              </tr>
              <tr className="bg-gray-200">
                {ensaio.agregados?.map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th className="border border-gray-400 p-1 text-xs text-gray-800">Ret (g)</th>
                    <th className="border border-gray-400 p-1 text-xs text-gray-800">Pass %</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {peneirasVisiveis.map((pKey, rowIdx) => {
                const pInfo = PENEIRAS_MAP[pKey];
                return (
                  <tr key={pKey} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-400 p-1 font-semibold text-center">{pInfo.astm}</td>
                    <td className="border border-gray-400 p-1 text-center">{pInfo.mm}</td>
                    {ensaio.agregados?.map((agg, aggIdx) => (
                      <React.Fragment key={aggIdx}>
                        <td className="border border-gray-400 p-1 text-center">{agg.granulometria?.[pKey]?.retido ?? (agg.granulometria?.[pKey]?.retido === 0 ? '0' : '-')}</td>
                        <td className="border border-gray-400 p-1 text-center">{agg.granulometria?.[pKey]?.passante ?? (agg.granulometria?.[pKey]?.passante === 0 ? '0' : '-')}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </section>

      {/* Determinação de Umidade */}
      {ensaio.agregados?.some(agg => agg.umidade != null || agg.peso_umido != null) && (
        <section className="mb-4">
          <p className="text-xs text-center font-bold mb-2">DETERMINAÇÃO DE UMIDADE</p>
          <table className="w-full border-collapse border border-gray-400 text-xs">
            <thead className="bg-slate-700">
              <tr>
                <th className="border border-gray-400 p-2 text-xs text-white">Agregado</th>
                <th className="border border-gray-400 p-2 text-xs text-white">Amostra Úmida (g)</th>
                <th className="border border-gray-400 p-2 text-xs text-white">Amostra Seca (g)</th>
                <th className="border border-gray-400 p-2 text-xs text-white">Umidade (%)</th>
              </tr>
            </thead>
            <tbody>
              {ensaio.agregados?.map((agg, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 p-2 font-semibold text-center text-xs">{agg.nome || `Agregado ${idx + 1}`}</td>
                  <td className="border border-gray-400 p-2 text-center text-xs">{agg.peso_umido ?? '-'}</td>
                  <td className="border border-gray-400 p-2 text-center text-xs">{agg.peso_seco ?? '-'}</td>
                  <td className="border border-gray-400 p-2 text-center text-xs font-semibold">{agg.umidade != null ? `${agg.umidade}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Gráfico de Granulometria */}
      <div className="border border-gray-400 p-4 mb-4 bg-white" style={{ pageBreakBefore: 'always' }}>
        <h3 className="text-xs font-bold text-center mb-2">GRANULOMETRIA DA AMOSTRA</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="mm"
              scale="log"
              domain={['auto', 'auto']}
              type="number"
              ticks={chartData.map(d => d.mm)}
              tickFormatter={(mm) => {
                const point = chartData.find(d => d.mm === mm);
                return point ? point.astm : mm;
              }}
              tick={{ fontSize: 9 }}
              label={{ value: 'Peneiras', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              label={{ value: '% Passante', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip formatter={(value) => value.toFixed(2)} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {ensaio.agregados?.map((agg, idx) => (
              <Line 
                key={idx}
                type="linear" 
                dataKey={`Agregado ${idx + 1}`}
                name={agg.nome || `Agregado ${idx + 1}`}
                stroke={colors[idx % colors.length]}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Equivalente de Areia */}
      <section className="mb-4">
        <p className="text-xs text-center font-bold mb-2">MÉTODO DE ENSAIO DE EQUIVALENTE DE AREIA - DNIT 450/2024</p>
        <table className="w-full border-collapse border border-gray-400 text-xs">
          <thead className="bg-slate-700">
            <tr>
              <th className="border border-gray-400 p-2 text-xs text-white">Parâmetro</th>
              <th className="border border-gray-400 p-2 text-xs text-white">Fórmula</th>
              <th className="border border-gray-400 p-2 text-xs text-white">Unidade</th>
              {ensaio.equivalente_areia?.medicoes?.map((_, index) => (
                <th key={index} className="border border-gray-400 p-2 text-xs text-white">Med. {index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-400 p-2 font-semibold text-xs">Topo Argila</td>
              <td className="border border-gray-400 p-2 text-center text-xs">H₁</td>
              <td className="border border-gray-400 p-2 text-center text-xs">cm</td>
              {ensaio.equivalente_areia?.medicoes?.map((medicao, index) => (
                <td key={index} className="border border-gray-400 p-2 text-center text-xs">
                  {medicao.topo_argila || '-'}
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-400 p-2 font-semibold text-xs">Topo Areia</td>
              <td className="border border-gray-400 p-2 text-center text-xs">H₂</td>
              <td className="border border-gray-400 p-2 text-center text-xs">cm</td>
              {ensaio.equivalente_areia?.medicoes?.map((medicao, index) => (
                <td key={index} className="border border-gray-400 p-2 text-center text-xs">
                  {medicao.topo_areia || '-'}
                </td>
              ))}
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-gray-400 p-2 font-semibold text-xs">Equivalente Areia</td>
              <td className="border border-gray-400 p-2 text-center text-xs">(H₂/H₁)×100</td>
              <td className="border border-gray-400 p-2 text-center text-xs">%</td>
              {ensaio.equivalente_areia?.medicoes?.map((medicao, index) => (
                <td key={index} className="border border-gray-400 p-2 text-center text-xs">
                  {medicao.equivalente || '-'}
                </td>
              ))}
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-gray-400 p-2 font-bold text-xs">Média</td>
              <td className="border border-gray-400 p-2"></td>
              <td className="border border-gray-400 p-2 text-center text-xs font-bold">%</td>
              <td className="border border-gray-400 p-2 text-center font-bold text-xs" colSpan={ensaio.equivalente_areia?.medicoes?.length || 1}>
                {ensaio.equivalente_areia?.media || '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Observações */}
      {ensaio.observacoes && (
        <section className="mb-4">
          <div className="border border-gray-400 p-3 bg-white">
            <p className="font-semibold text-xs mb-2">OBSERVAÇÕES:</p>
            <p className="text-xs whitespace-pre-wrap text-gray-700">{ensaio.observacoes}</p>
          </div>
        </section>
      )}

      {/* Assinaturas */}
      <footer className="mt-6 pt-6 print:break-inside-avoid">
        <SignatureFooter {...buildSignatureProps(ensaio)} />
      </footer>
      </div>
      <PrintStyles />
    </>
  );
}