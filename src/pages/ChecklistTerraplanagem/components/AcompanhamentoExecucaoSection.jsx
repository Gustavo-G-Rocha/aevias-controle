import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CheckboxGroup = ({ value, onChange }) => (
  <div className="flex gap-4 justify-center">
    {[['sim', 'Sim', 'accent-green-500'], ['nao', 'Não', 'accent-red-500'], ['na', 'N/A', 'accent-gray-500']].map(([opt, lbl, cls]) => (
      <label key={opt} className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={value?.[opt] || false} onChange={() => onChange(opt)} className={`w-4 h-4 ${cls}`} />
        <span className="text-xs">{lbl}</span>
      </label>
    ))}
  </div>
);

export default function AcompanhamentoExecucaoSection({ acompanhamento, onCheckboxChange, onRoloChange, onObservacoesChange }) {
  const rows = [
    { field: 'remocao_material_existente', label: 'Foi realizado remoção de material existente?' },
    { field: 'espalhamento_material_novo', label: 'Foi espalhado material novo para construção da camada?' },
    { field: 'ensaio_viga_benkelman', label: 'Foi realizado ensaio de viga Benkelman para liberação da camada?' },
    { field: 'teste_carga', label: 'Foi realizado teste de carga para liberação da camada?' },
    { field: 'falha_compactacao', label: 'Há algum ponto de falha de compactação (borrachudo)?' },
  ];

  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-lg">Acompanhamento Execução da Camada</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-2 text-left font-medium">Controle</th>
                <th className="border border-slate-300 px-2 py-2 text-center font-medium w-32">Resposta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ field, label }) => (
                <tr key={field}>
                  <td className="border border-slate-300 px-2 py-2 bg-slate-50">{label}</td>
                  <td className="border border-slate-300 px-2 py-2">
                    <CheckboxGroup
                      value={acompanhamento[field]}
                      onChange={(opt) => onCheckboxChange(field, opt)}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-slate-300 px-2 py-2 bg-slate-50">
                  A compactação da camada foi realizada em conformidade à energia de projeto?
                  <div className="flex gap-4 mt-2 ml-4">
                    {[['rolo_liso', 'ROLO LISO'], ['rolo_pneu', 'ROLO DE PNEU'], ['rolo_pe_carneiro', 'ROLO PÉ DE CARNEIRO']].map(([rolo, label]) => (
                      <label key={rolo} className="flex items-center gap-1">
                        <input type="checkbox" checked={acompanhamento.compactacao_conforme_projeto?.[rolo] || false} onChange={() => onRoloChange(rolo)} className="w-4 h-4" />
                        <span className="text-xs">{label}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="border border-slate-300 px-2 py-2">
                  <CheckboxGroup
                    value={acompanhamento.compactacao_conforme_projeto}
                    onChange={(opt) => onCheckboxChange('compactacao_conforme_projeto', opt)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Label>Observações do Acompanhamento</Label>
          <Textarea
            value={acompanhamento.observacoes}
            onChange={(e) => onObservacoesChange(e.target.value)}
            rows={2}
            placeholder="Observações sobre o acompanhamento..."
          />
        </div>
      </CardContent>
    </Card>
  );
}