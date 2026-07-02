import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CheckboxGroup = ({ value, onChange }) => (
  <div className="flex gap-4 justify-center">
    {[['sim', 'Sim', 'accent-green-500'], ['nao', 'Não', 'accent-red-500'], ['na', 'N/A', 'accent-gray-500']].map(([opt, lbl, cls]) => (
      <label key={opt} className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={value?.[opt] || false}
          onChange={(e) => { e.stopPropagation(); onChange(opt); }}
          className={`w-4 h-4 ${cls}`} />
        <span className="text-xs">{lbl}</span>
      </label>
    ))}
  </div>
);

const ROLOS = [
  ['rolo_pe_carneiro', 'ROLO PÉ DE CARNEIRO'],
  ['rolo_liso', 'ROLO LISO'],
  ['rolo_pneu', 'ROLO PNEU'],
];

export default function AcompanhamentoExecucaoSection({ acompanhamento, onCheckboxChange, onRoloChange, setFormData, isEditable }) {
  const setAcomp = (patch) => setFormData(prev => ({ ...prev, acompanhamento_execucao: { ...prev.acompanhamento_execucao, ...patch } }));
  const setSubField = (field, patch) => setFormData(prev => ({
    ...prev,
    acompanhamento_execucao: {
      ...prev.acompanhamento_execucao,
      [field]: { ...prev.acompanhamento_execucao[field], ...patch },
    },
  }));

  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle className="text-lg">Acompanhamento Execução da Camada</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-border px-2 py-2 text-left font-medium">Controle</th>
                <th className="border border-border px-2 py-2 text-center font-medium w-32">Resposta</th>
                <th className="border border-border px-2 py-2 text-left font-medium">Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">Foi realizado remoção de material existente?</td>
                <td className="border border-border px-2 py-2">
                  <CheckboxGroup value={acompanhamento.remocao_material_existente} onChange={(opt) => onCheckboxChange('acompanhamento_execucao', 'remocao_material_existente', opt)} />
                </td>
                <td className="border border-border px-2 py-2">
                  <Input placeholder="KM DO BOTA FORA" value={acompanhamento.remocao_material_existente.km_bota_fora || ""} disabled={!isEditable}
                    onChange={(e) => setSubField('remocao_material_existente', { km_bota_fora: e.target.value })} className="h-8 text-sm" />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">Foi espalhado material novo para construção da camada?</td>
                <td className="border border-border px-2 py-2">
                  <CheckboxGroup value={acompanhamento.espalhamento_material_novo} onChange={(opt) => onCheckboxChange('acompanhamento_execucao', 'espalhamento_material_novo', opt)} />
                </td>
                <td className="border border-border px-2 py-2">
                  <Input placeholder="TIPO DE MATERIAL" value={acompanhamento.espalhamento_material_novo.tipo_material || ""} disabled={!isEditable}
                    onChange={(e) => setSubField('espalhamento_material_novo', { tipo_material: e.target.value })} className="h-8 text-sm" />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">
                  A compactação da camada foi realizada em conformidade à energia de projeto?
                  <div className="flex gap-4 mt-2 ml-4">
                    {ROLOS.map(([rolo, label]) => (
                      <label key={rolo} className="flex items-center gap-1">
                        <input type="checkbox" checked={acompanhamento.compactacao_conforme_projeto[rolo]}
                          onChange={() => onRoloChange(rolo)} className="w-4 h-4" disabled={!isEditable} />
                        <span className="text-xs">{label}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="border border-border px-2 py-2">
                  <CheckboxGroup value={acompanhamento.compactacao_conforme_projeto} onChange={(opt) => onCheckboxChange('acompanhamento_execucao', 'compactacao_conforme_projeto', opt)} />
                </td>
                <td className="border border-border px-2 py-2"></td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">Foi realizado ensaio de viga Benkelman para liberação da camada?</td>
                <td className="border border-border px-2 py-2">
                  <CheckboxGroup value={acompanhamento.ensaio_viga_benkelman} onChange={(opt) => onCheckboxChange('acompanhamento_execucao', 'ensaio_viga_benkelman', opt)} />
                </td>
                <td className="border border-border px-2 py-2"></td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">Espessura Reciclada?</td>
                <td className="border border-border px-2 py-2" colSpan="2">
                  <Input placeholder="Informe a espessura" value={acompanhamento.espessura_reciclada || ""} disabled={!isEditable}
                    onChange={(e) => setAcomp({ espessura_reciclada: e.target.value })} className="h-8 text-sm" />
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">Foi realizado teste de carga para liberação da camada?</td>
                <td className="border border-border px-2 py-2">
                  <CheckboxGroup value={acompanhamento.teste_carga} onChange={(opt) => onCheckboxChange('acompanhamento_execucao', 'teste_carga', opt)} />
                </td>
                <td className="border border-border px-2 py-2"></td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-2 bg-slate-50">Há algum ponto de falha de compactação (borrachudo)?</td>
                <td className="border border-border px-2 py-2">
                  <CheckboxGroup value={acompanhamento.falha_compactacao} onChange={(opt) => onCheckboxChange('acompanhamento_execucao', 'falha_compactacao', opt)} />
                </td>
                <td className="border border-border px-2 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Label>Observações do Acompanhamento</Label>
          <Textarea value={acompanhamento.observacoes} disabled={!isEditable}
            onChange={(e) => setAcomp({ observacoes: e.target.value })}
            rows={2} placeholder="Observações sobre o acompanhamento..." />
        </div>
      </CardContent>
    </Card>
  );
}