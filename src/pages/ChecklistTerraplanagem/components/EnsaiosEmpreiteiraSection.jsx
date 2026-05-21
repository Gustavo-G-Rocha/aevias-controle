import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ENSAIOS_CONFIG = [
  { key: 'compactacao_proctor', label: 'Compactação - Proctor (g/cm³)', step: '0.001' },
  { key: 'isc', label: 'ISC - Índice de Suporte Califórnia (%)', step: '0.1' },
  { key: 'umidade_frigideira', label: 'Umidade (Frigideira) (%)', step: '0.01' },
  { key: 'massa_especifica_in_situ', label: 'Massa Específica In Situ (g/cm³)', step: '0.001', syncQtde: true },
  { key: 'granulometria', label: 'Análise Granulométrica por Peneiramento', step: null },
];

const toArray = (resultados) => {
  if (Array.isArray(resultados)) return resultados;
  if (typeof resultados === 'string' && resultados.trim() !== '') return resultados.split('|').map(s => s.trim());
  return [];
};

const CalcRow = ({ label, qtde, resultados, conforme, onQtdeChange, onConformeChange }) => (
  <tr>
    <td className="border border-slate-300 px-2 py-2 bg-slate-50">{label}</td>
    <td className="border border-slate-300 px-2 py-1 text-center">-</td>
    <td className="border border-slate-300 px-1 py-1">
      <Input type="number" min="0" max="3" value={qtde} onChange={onQtdeChange} className="h-8 text-sm text-center" placeholder="" />
    </td>
    <td className="border border-slate-300 px-1 py-2">
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: qtde }).map((_, idx) => (
          <div key={idx} className="h-8 flex items-center px-2 bg-slate-100 rounded border border-slate-300 text-sm text-center font-medium"
            style={{ width: qtde > 1 ? '90px' : '100%' }}>
            {resultados[idx] ?? '-'}
          </div>
        ))}
      </div>
    </td>
    <td className="border border-slate-300 px-2 py-1 text-center">
      <input type="checkbox" checked={conforme === true} onChange={(e) => onConformeChange(e.target.checked ? true : null)} className="w-4 h-4 accent-green-500" />
    </td>
    <td className="border border-slate-300 px-2 py-1 text-center">
      <input type="checkbox" checked={conforme === false} onChange={(e) => onConformeChange(e.target.checked ? false : null)} className="w-4 h-4 accent-red-500" />
    </td>
  </tr>
);

export default function EnsaiosEmpreiteiraSection({ formData, onEnsaioChange, setFormData }) {
  const ee = formData.ensaios_empreiteira;

  // Variação de umidade calculada por R
  const uOtimaArr = toArray(formData.umidade_otima_resultados);
  const uisArr = toArray(formData.umidade_in_situ_resultados);
  const vuQtde = ee.variacao_umidade_quantidade || 0;
  const vuResultados = Array.from({ length: vuQtde }).map((_, idx) => {
    const a = parseFloat(uOtimaArr[idx]), b = parseFloat(uisArr[idx]);
    return (isNaN(a) || isNaN(b)) ? null : (b - a).toFixed(2);
  });

  // Grau de compactação calculado por R
  const proctorArr = toArray(ee.compactacao_proctor?.resultados);
  const inSituArr = toArray(ee.massa_especifica_in_situ?.resultados);
  const gcQtde = ee.grau_compactacao_quantidade || 0;
  const gcResultados = Array.from({ length: gcQtde }).map((_, idx) => {
    const p = parseFloat(proctorArr[idx]), s = parseFloat(inSituArr[idx]);
    return (isNaN(p) || isNaN(s) || p === 0) ? null : ((s / p) * 100).toFixed(2);
  });

  const setEE = (patch) => setFormData(prev => ({ ...prev, ensaios_empreiteira: { ...prev.ensaios_empreiteira, ...patch } }));

  // Umidade Ótima row
  const uoQtde = formData.umidade_otima_quantidade || 0;
  const uoResultados = toArray(formData.umidade_otima_resultados);
  const uisQtde = formData.umidade_in_situ_quantidade || 0;
  const uisResultados = toArray(formData.umidade_in_situ_resultados);

  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-lg">Ensaios da Camada Realizados pela Empreiteira</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-2 text-left font-medium">Ensaios</th>
                <th className="border border-slate-300 px-2 py-2 text-center font-medium w-20">Realizado</th>
                <th className="border border-slate-300 px-2 py-2 text-center font-medium w-16">Qtde</th>
                <th className="border border-slate-300 px-2 py-2 text-left font-medium">Resultado(s)</th>
                <th className="border border-slate-300 px-2 py-2 text-center font-medium w-10">✓</th>
                <th className="border border-slate-300 px-2 py-2 text-center font-medium w-10">✗</th>
              </tr>
            </thead>
            <tbody>
              {ENSAIOS_CONFIG.map(({ key, label, step, syncQtde }) => {
                const e = ee[key] || {};
                const qtde = e.quantidade || 0;
                const resultados = toArray(e.resultados);
                const isGranulometria = key === 'granulometria';
                return (
                  <tr key={key}>
                    <td className="border border-slate-300 px-2 py-2 bg-slate-50">{label}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      <input type="checkbox" checked={e.realizado || false}
                        onChange={(ev) => onEnsaioChange(key, 'realizado', ev.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-slate-300 px-1 py-1">
                      {isGranulometria ? <span className="text-slate-400 text-xs px-2">-</span> : (
                        <Input type="number" min="0" max="3" value={qtde ?? ''}
                          onChange={(ev) => {
                            onEnsaioChange(key, 'quantidade', ev.target.value);
                            if (syncQtde) {
                              const n = Math.max(0, Math.min(3, parseInt(ev.target.value) || 0));
                              setEE({ variacao_umidade_quantidade: n, variacao_umidade_resultados: [], grau_compactacao_quantidade: n, grau_compactacao_resultados: [] });
                            }
                          }}
                          disabled={!e.realizado} className="h-8 text-sm text-center" />
                      )}
                    </td>
                    <td className="border border-slate-300 px-1 py-2">
                      {isGranulometria ? <span className="text-slate-400 text-xs px-2">-</span> : (
                        e.realizado && qtde > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Array.from({ length: qtde }).map((_, idx) => (
                              <Input key={idx} type={step ? 'number' : 'text'} step={step || undefined}
                                value={resultados[idx] ?? ''}
                                onChange={(ev) => onEnsaioChange(key, `resultado_${idx}`, ev.target.value)}
                                className="h-8 text-sm text-center"
                                style={{ width: qtde > 1 ? '90px' : '100%' }}
                                placeholder={qtde > 1 ? `R${idx + 1}` : 'Resultado'} />
                            ))}
                          </div>
                        ) : <span className="text-slate-400 text-xs px-2">-</span>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      <input type="checkbox" checked={e.conforme === true}
                        onChange={(ev) => onEnsaioChange(key, 'conforme', ev.target.checked ? true : null)}
                        disabled={!e.realizado} className="w-4 h-4 accent-green-500" />
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      <input type="checkbox" checked={e.conforme === false}
                        onChange={(ev) => onEnsaioChange(key, 'conforme', ev.target.checked ? false : null)}
                        disabled={!e.realizado} className="w-4 h-4 accent-red-500" />
                    </td>
                  </tr>
                );
              })}

              {/* Umidade Ótima */}
              <tr>
                <td className="border border-slate-300 px-2 py-2 bg-slate-50">Umidade Ótima (%)</td>
                <td className="border border-slate-300 px-2 py-1 text-center">-</td>
                <td className="border border-slate-300 px-1 py-1">
                  <Input type="number" min="0" max="3" value={uoQtde}
                    onChange={(e) => {
                      const n = Math.max(0, Math.min(3, parseInt(e.target.value) || 0));
                      const cur = toArray(formData.umidade_otima_resultados);
                      setFormData(prev => ({ ...prev, umidade_otima_quantidade: n, umidade_otima_resultados: n > cur.length ? [...cur, ...Array(n - cur.length).fill(null)] : cur.slice(0, n) }));
                    }}
                    className="h-8 text-sm text-center" />
                </td>
                <td className="border border-slate-300 px-1 py-2">
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: uoQtde }).map((_, idx) => (
                      <Input key={idx} type="number" step="0.01" value={uoResultados[idx] ?? ''}
                        onChange={(e) => {
                          const arr = [...(toArray(formData.umidade_otima_resultados).length >= uoQtde ? toArray(formData.umidade_otima_resultados) : Array(uoQtde).fill(null))];
                          arr[idx] = e.target.value !== '' ? e.target.value : null;
                          setFormData(prev => ({ ...prev, umidade_otima_resultados: arr }));
                        }}
                        className="h-8 text-sm text-center" style={{ width: uoQtde > 1 ? '90px' : '100%' }}
                        placeholder={uoQtde > 1 ? `R${idx + 1}` : 'Resultado'} />
                    ))}
                  </div>
                </td>
                <td className="border border-slate-300 px-2 py-1 text-center">-</td>
                <td className="border border-slate-300 px-2 py-1 text-center">-</td>
              </tr>

              {/* Umidade In Situ */}
              <tr>
                <td className="border border-slate-300 px-2 py-2 bg-slate-50">Umidade In Situ (%)</td>
                <td className="border border-slate-300 px-2 py-1 text-center">-</td>
                <td className="border border-slate-300 px-1 py-1">
                  <Input type="number" min="0" max="3" value={uisQtde}
                    onChange={(e) => {
                      const n = Math.max(0, Math.min(3, parseInt(e.target.value) || 0));
                      const cur = toArray(formData.umidade_in_situ_resultados);
                      setFormData(prev => ({ ...prev, umidade_in_situ_quantidade: n, umidade_in_situ_resultados: n > cur.length ? [...cur, ...Array(n - cur.length).fill(null)] : cur.slice(0, n) }));
                    }}
                    className="h-8 text-sm text-center" />
                </td>
                <td className="border border-slate-300 px-1 py-2">
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: uisQtde }).map((_, idx) => (
                      <Input key={idx} type="number" step="0.01" value={uisResultados[idx] ?? ''}
                        onChange={(e) => {
                          const arr = [...(toArray(formData.umidade_in_situ_resultados).length >= uisQtde ? toArray(formData.umidade_in_situ_resultados) : Array(uisQtde).fill(null))];
                          arr[idx] = e.target.value !== '' ? e.target.value : null;
                          setFormData(prev => ({ ...prev, umidade_in_situ_resultados: arr }));
                        }}
                        className="h-8 text-sm text-center" style={{ width: uisQtde > 1 ? '90px' : '100%' }}
                        placeholder={uisQtde > 1 ? `R${idx + 1}` : 'Resultado'} />
                    ))}
                  </div>
                </td>
                <td className="border border-slate-300 px-2 py-1 text-center">-</td>
                <td className="border border-slate-300 px-2 py-1 text-center">-</td>
              </tr>

              {/* Variação de Umidade */}
              <CalcRow
                label="Variação de Umidade (%)"
                qtde={vuQtde}
                resultados={vuResultados}
                conforme={ee.variacao_umidade_conforme}
                onQtdeChange={(e) => { const n = Math.max(0, Math.min(3, parseInt(e.target.value) || 0)); setEE({ variacao_umidade_quantidade: n, variacao_umidade_resultados: [] }); }}
                onConformeChange={(v) => setEE({ variacao_umidade_conforme: v })}
              />

              {/* Grau de Compactação */}
              <CalcRow
                label="Grau de Compactação (%)"
                qtde={gcQtde}
                resultados={gcResultados}
                conforme={ee.grau_compactacao_conforme}
                onQtdeChange={(e) => { const n = Math.max(0, Math.min(3, parseInt(e.target.value) || 0)); setEE({ grau_compactacao_quantidade: n, grau_compactacao_resultados: [] }); }}
                onConformeChange={(v) => setEE({ grau_compactacao_conforme: v })}
              />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}