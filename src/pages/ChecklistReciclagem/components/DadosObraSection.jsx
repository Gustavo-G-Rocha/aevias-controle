import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DadosObraSection({ formData, setFormData, obras, obraSelecionada, projects, isEditable, editingChecklist }) {
  const set = (patch) => setFormData(prev => ({ ...prev, ...patch }));
  const setJornada = (patch) => setFormData(prev => ({ ...prev, jornada: { ...prev.jornada, ...patch } }));

  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-lg">Dados da Obra</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={(v) => set({ obra_id: v, project_id: "", faixa: "" })}
              disabled={!!editingChecklist?.id || !isEditable}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" value={formData.data} onChange={(e) => set({ data: e.target.value })} disabled={!isEditable} required />
          </div>
          <div>
            <Label>Horário Início *</Label>
            <Input type="time" value={formData.jornada?.horario_inicio || ""} onChange={(e) => setJornada({ horario_inicio: e.target.value })} disabled={!isEditable} required />
          </div>
          <div>
            <Label>Horário Fim *</Label>
            <Input type="time" value={formData.jornada?.horario_fim || ""} onChange={(e) => setJornada({ horario_fim: e.target.value })} disabled={!isEditable} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Rodovia *</Label>
            <Select value={formData.rodovia} onValueChange={(v) => set({ rodovia: v })} disabled={!formData.obra_id || !isEditable}>
              <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent>{(obraSelecionada?.rodovias || []).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Empreiteira *</Label>
            <Select value={formData.empreiteira} onValueChange={(v) => set({ empreiteira: v })} disabled={!formData.obra_id || !isEditable}>
              <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
              <SelectContent>{(obraSelecionada?.empreiteiras || []).map(em => <SelectItem key={em} value={em}>{em}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estaca *</Label>
            <Input value={formData.estaca} onChange={(e) => set({ estaca: e.target.value })} disabled={!isEditable} placeholder="Ex: km 10+500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Projeto</Label>
            <Select value={formData.project_id || ""} onValueChange={(v) => set({ project_id: v })} disabled={!formData.obra_id || !isEditable}>
              <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
              <SelectContent>{projects.filter(p => p.tipo_projeto === 'CAMADAS_GRANULARES').map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trecho</Label>
            <Input value={formData.trecho} onChange={(e) => set({ trecho: e.target.value })} disabled={!isEditable} placeholder="Descrição do trecho" />
          </div>
          <div>
            <Label>Faixa</Label>
            <Input value={formData.faixa} onChange={(e) => set({ faixa: e.target.value })} disabled={!isEditable} placeholder="Faixa especificada" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Material *</Label>
            <Input value={formData.material} onChange={(e) => set({ material: e.target.value })} disabled={!isEditable} placeholder="Material utilizado" />
          </div>
          <div>
            <Label>Inspetor de Campo</Label>
            <Input value={formData.inspetor_fiscal} onChange={(e) => set({ inspetor_fiscal: e.target.value })} disabled={!isEditable} />
          </div>
          <div>
            <Label>Ensaio realizado por:</Label>
            <Select value={formData.ensaio_realizado_por || "Afirma Evias"} onValueChange={(v) => set({ ensaio_realizado_por: v })} disabled={!isEditable}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                <SelectItem value="Empreiteira">Empreiteira</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}