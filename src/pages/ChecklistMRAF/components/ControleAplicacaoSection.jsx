import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LADOS = [
  { value: "direito", label: "Direito" },
  { value: "esquerdo", label: "Esquerdo" },
  { value: "ambos", label: "Ambos" },
];

export default function ControleAplicacaoSection({ data, onChange, isEditable, isApproved }) {
  const disabled = !isEditable || isApproved;
  const set = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Controle de Aplicação</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div>
          <Label className="text-base">km/estaca inicial</Label>
          <Input value={data.km_estaca_inicial} onChange={(e) => set('km_estaca_inicial', e.target.value)}
            disabled={disabled} className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
        </div>
        <div>
          <Label className="text-base">Lado inicial</Label>
          <Select value={data.lado_inicial || "direito"} onValueChange={(v) => set('lado_inicial', v)} disabled={disabled}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LADOS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-base">km/estaca final</Label>
          <Input value={data.km_estaca_final} onChange={(e) => set('km_estaca_final', e.target.value)}
            disabled={disabled} className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
        </div>
        <div>
          <Label className="text-base">Lado final</Label>
          <Select value={data.lado_final || "direito"} onValueChange={(v) => set('lado_final', v)} disabled={disabled}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LADOS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-base">Quantidade aplicada (m²)</Label>
          <Input type="number" value={data.quantidade_aplicada_m2 || ''}
            onChange={(e) => set('quantidade_aplicada_m2', e.target.value ? parseFloat(e.target.value) : null)}
            disabled={disabled} className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
        </div>
      </div>
      <div className="mt-3">
        <Label className="text-base">Observações</Label>
        <Textarea value={data.observacoes} onChange={(e) => set('observacoes', e.target.value)}
          disabled={disabled} rows={4} maxLength={500}
          className="bg-white border-slate-200 text-slate-700 text-base" />
        <p className="text-sm text-right text-slate-600 mt-1">{data.observacoes?.length || 0} / 500 caracteres</p>
      </div>
    </div>
  );
}