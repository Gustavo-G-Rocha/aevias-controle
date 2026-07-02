import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ENSAIOS = [
  { key: 'compactacao_proctor', label: 'Compactação - Proctor' },
  { key: 'taxa_agregado', label: 'Taxa de agregado' },
  { key: 'taxa_cimento', label: 'Taxa de cimento' },
  { key: 'umidade_frigideira', label: 'Umidade pelo método expedito da "frigideira"' },
  { key: 'massa_especifica_in_situ', label: 'Determinação da massa específica aparente seca "in situ"' },
  { key: 'granulometria', label: 'Análise granulométrica por peneiramento' },
  { key: 'moldagem_resistencia', label: 'Moldagem para resistência' },
  { key: 'viga_benkelman', label: 'Viga Benkelman' },
  { key: 'taxa_pintura_ligacao', label: 'Taxa de pintura de ligação' },
  { key: 'finura_cimento', label: 'Determinação da finura do cimento' },
];

export default function EnsaiosEmpreiteiraSection({ ensaios, onChange, isEditable }) {
  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle className="text-lg">Acompanhamento dos Ensaios Realizados pela Empreiteira</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-2 py-2 text-left font-medium">Ensaios</th>
                <th className="border border-border px-2 py-2 text-center font-medium w-24">Realizado</th>
                <th className="border border-border px-2 py-2 text-center font-medium w-20">Qtde</th>
                <th className="border border-border px-2 py-2 text-center font-medium w-32">Conformidade</th>
                <th className="border border-border px-2 py-2 text-left font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {ENSAIOS.map(({ key, label }) => {
                const e = ensaios[key];
                return (
                  <tr key={key}>
                    <td className="border border-border px-2 py-2 bg-muted/30">{label}</td>
                    <td className="border border-border px-2 py-1 text-center">
                      <input type="checkbox" checked={e.realizado} disabled={!isEditable}
                        onChange={(ev) => onChange(key, 'realizado', ev.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-border px-1 py-1">
                      <Input type="number" min="0" value={e.quantidade || ''} disabled={!e.realizado || !isEditable}
                        onChange={(ev) => onChange(key, 'quantidade', ev.target.value)} className="h-8 text-sm text-center" placeholder="0" />
                    </td>
                    <td className="border border-border px-2 py-1">
                      <div className="flex gap-2 justify-center">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={e.conforme === true} disabled={!e.realizado || !isEditable}
                            onChange={(ev) => onChange(key, 'conforme', ev.target.checked ? true : null)} className="w-4 h-4 accent-green-500" />
                          <span className="text-xs text-green-600">✓</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={e.conforme === false} disabled={!e.realizado || !isEditable}
                            onChange={(ev) => onChange(key, 'conforme', ev.target.checked ? false : null)} className="w-4 h-4 accent-red-500" />
                          <span className="text-xs text-red-600">✗</span>
                        </label>
                      </div>
                    </td>
                    <td className="border border-border px-1 py-1">
                      <Input value={e.resultados} disabled={!e.realizado || !isEditable}
                        onChange={(ev) => onChange(key, 'resultados', ev.target.value)} className="h-8 text-sm" placeholder="Resultado" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}