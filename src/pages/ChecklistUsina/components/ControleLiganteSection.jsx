import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ENSAIOS_LIGANTE = [
  { label: "Recuperação Elástica", key: "recuperacao_elastica", unidade: "%", spec: "ABNT NBR - 15086" },
  { label: "Penetração (100g, 5s, 25ºC)", key: "penetracao", unidade: "0,1 mm", spec: "ABNT NBR - 6576" },
  { label: "Ponto de Amolecimento", key: "ponto_amolecimento", unidade: "ºC", spec: "ABNT NBR - 6560" },
  { label: "Ponto de Fulgor", key: "ponto_fulgor", unidade: "ºC", spec: "ABNT NBR - 11341" },
];

function ViscosidadeRow({ num, ligante, canEdit, onNestedChange, stripedClass }) {
  const prefix = `viscosidade_${num}`;
  return (
    <tr className={stripedClass}>
      <td className="border border-slate-300 px-3 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          <span>Viscosidade Brookfield a</span>
          <Input type="text" value={ligante?.[`${prefix}_temp`] || ''}
            onChange={(e) => onNestedChange('controle_ligante', `${prefix}_temp`, e.target.value)}
            disabled={!canEdit} className="h-7 w-14 text-xs px-1" placeholder="__" />
          <span>ºC, SP</span>
          <Input type="text" value={ligante?.[`${prefix}_sp`] || ''}
            onChange={(e) => onNestedChange('controle_ligante', `${prefix}_sp`, e.target.value)}
            disabled={!canEdit} className="h-7 w-14 text-xs px-1" placeholder="__" />
          <span>[</span>
          <Input type="text" value={ligante?.[`${prefix}_rpm`] || ''}
            onChange={(e) => onNestedChange('controle_ligante', `${prefix}_rpm`, e.target.value)}
            disabled={!canEdit} className="h-7 w-14 text-xs px-1" placeholder="__" />
          <span>rpm]</span>
        </div>
      </td>
      <td className="border border-slate-300 px-3 py-2 text-center text-xs">cP</td>
      <td className="border border-slate-300 px-3 py-2">
        <Input type="number" step="0.1" value={ligante?.[`${prefix}_resultado`] || ''}
          onChange={(e) => onNestedChange('controle_ligante', `${prefix}_resultado`, e.target.value ? parseFloat(e.target.value) : null)}
          disabled={!canEdit} className="h-8 text-sm" />
      </td>
      <td className="border border-slate-300 px-3 py-2">
        <Input type="text" value={ligante?.[`${prefix}_limite`] || ''}
          onChange={(e) => onNestedChange('controle_ligante', `${prefix}_limite`, e.target.value)}
          disabled={!canEdit} className="h-8 text-sm text-center" />
      </td>
      <td className="border border-slate-300 px-3 py-2 text-xs text-center">
        {num === 2 ? 'ABNT NBR - 15529' : 'ABNT NBR - 15184'}
      </td>
      <td className="border border-slate-300 px-3 py-2 text-center">
        <input type="checkbox" checked={ligante?.[`${prefix}_conforme`] || false}
          onChange={(e) => onNestedChange('controle_ligante', `${prefix}_conforme`, e.target.checked)}
          disabled={!canEdit} className="w-5 h-5" />
      </td>
    </tr>
  );
}

export default function ControleLiganteSection({ formData, isEditable, isApproved, onNestedChange, onChange }) {
  const canEdit = isEditable && !isApproved;
  const ligante = formData.controle_ligante;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Controle de Qualidade de Ligantes</CardTitle>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="controle_ligante_ativo"
              checked={formData.controle_ligante_ativo || false}
              onChange={(e) => onChange('controle_ligante_ativo', e.target.checked)}
              disabled={!canEdit} className="w-4 h-4" />
            <Label htmlFor="controle_ligante_ativo" className="font-normal cursor-pointer">Preencher Controle de Ligante</Label>
          </div>
        </div>
      </CardHeader>

      {formData.controle_ligante_ativo && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fornecedor</Label>
              <Input value={ligante?.fornecedor || ''} disabled className="bg-slate-100"
                placeholder="Preenchido automaticamente pelo projeto" />
            </div>
            <div>
              <Label>Nota Fiscal</Label>
              <Input value={ligante?.nota_fiscal || ''}
                onChange={(e) => onNestedChange('controle_ligante', 'nota_fiscal', e.target.value)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>Placa Carreta</Label>
              <Input value={ligante?.placa_carreta || ''}
                onChange={(e) => onNestedChange('controle_ligante', 'placa_carreta', e.target.value)}
                disabled={!canEdit} />
            </div>
            <div>
              <Label>Quantidade (t)</Label>
              <Input type="number" step="0.1" value={ligante?.quantidade_toneladas || ''}
                onChange={(e) => onNestedChange('controle_ligante', 'quantidade_toneladas', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!canEdit} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-4">Ensaios Acompanhados</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Ensaio</th>
                    <th className="border border-slate-300 px-3 py-2 text-center font-semibold">Unidade</th>
                    <th className="border border-slate-300 px-3 py-2 text-center font-semibold">Resultado</th>
                    <th className="border border-slate-300 px-3 py-2 text-center font-semibold">Limite Esp.</th>
                    <th className="border border-slate-300 px-3 py-2 text-center font-semibold">Especificação</th>
                    <th className="border border-slate-300 px-3 py-2 text-center font-semibold">Conformidade</th>
                  </tr>
                </thead>
                <tbody>
                  <ViscosidadeRow num={1} ligante={ligante} canEdit={canEdit} onNestedChange={onNestedChange} stripedClass="bg-slate-50" />
                  <ViscosidadeRow num={2} ligante={ligante} canEdit={canEdit} onNestedChange={onNestedChange} stripedClass="" />
                  <ViscosidadeRow num={3} ligante={ligante} canEdit={canEdit} onNestedChange={onNestedChange} stripedClass="bg-slate-50" />
                  {ENSAIOS_LIGANTE.map((ensaio, idx) => (
                    <tr key={ensaio.key} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                      <td className="border border-slate-300 px-3 py-2">{ensaio.label}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center text-xs">{ensaio.unidade}</td>
                      <td className="border border-slate-300 px-3 py-2">
                        <Input type="number" step="0.1" value={ligante?.[`${ensaio.key}_resultado`] || ''}
                          onChange={(e) => onNestedChange('controle_ligante', `${ensaio.key}_resultado`, e.target.value ? parseFloat(e.target.value) : null)}
                          disabled={!canEdit} className="h-8 text-sm" />
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        <Input type="text" value={ligante?.[`${ensaio.key}_limite`] || ''}
                          onChange={(e) => onNestedChange('controle_ligante', `${ensaio.key}_limite`, e.target.value)}
                          disabled={!canEdit} className="h-8 text-sm text-center" />
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-xs text-center">{ensaio.spec}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">
                        <input type="checkbox" checked={ligante?.[`${ensaio.key}_conforme`] || false}
                          onChange={(e) => onNestedChange('controle_ligante', `${ensaio.key}_conforme`, e.target.checked)}
                          disabled={!canEdit} className="w-5 h-5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}