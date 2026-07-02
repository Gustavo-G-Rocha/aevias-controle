import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DadosObraSection({ formData, setFormData, obras, projects, editingChecklist }) {
  const set = (patch) => setFormData(prev => ({ ...prev, ...patch }));
  const setJornada = (patch) => setFormData(prev => ({ ...prev, jornada: { ...prev.jornada, ...patch } }));
  const obraSelecionada = obras.find(o => o.id === formData.obra_id);

  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle className="text-lg">Dados da Obra</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={(v) => set({ obra_id: v })}
              disabled={!!editingChecklist?.id}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Carta Traço de Concreto</Label>
            <Select value={formData.project_id || ""} onValueChange={(v) => set({ project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione a carta traço" /></SelectTrigger>
              <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Data *</Label>
            <Input type="date" value={formData.data} onChange={(e) => set({ data: e.target.value })} required />
          </div>
          <div>
            <Label>Horário Início *</Label>
            <Input type="time" value={formData.jornada?.horario_inicio || ""} onChange={(e) => setJornada({ horario_inicio: e.target.value })} required />
          </div>
          <div>
            <Label>Horário Fim *</Label>
            <Input type="time" value={formData.jornada?.horario_fim || ""} onChange={(e) => setJornada({ horario_fim: e.target.value })} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Concreteira</Label>
            <Input value={formData.concreteira} onChange={(e) => set({ concreteira: e.target.value })} placeholder="Nome da concreteira" />
          </div>
          <div>
            <Label>Empreiteira</Label>
            <Select value={formData.empreiteira} onValueChange={(v) => set({ empreiteira: v })} disabled={!formData.obra_id}>
              <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
              <SelectContent>{(obraSelecionada?.empreiteiras || []).map((em, i) => <SelectItem key={i} value={em}>{em}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rodovia</Label>
            <Select value={formData.rodovia} onValueChange={(v) => set({ rodovia: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent>{(obraSelecionada?.rodovias || []).map((r, i) => <SelectItem key={i} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Trecho</Label>
            <Input value={formData.trecho} onChange={(e) => set({ trecho: e.target.value })} placeholder="Descrição do trecho" />
          </div>
          <div>
            <Label>Volume (m³)</Label>
            <Input type="number" step="0.1" value={formData.volume} onChange={(e) => set({ volume: e.target.value })} />
          </div>
          <div>
            <Label>Fck (MPa)</Label>
            <Input type="number" step="0.1" value={formData.fck} onChange={(e) => set({ fck: e.target.value })} placeholder="Ex: 25" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Estrutura</Label>
            <Input value={formData.estrutura} onChange={(e) => set({ estrutura: e.target.value })} />
          </div>
          <div>
            <Label>Ensaio realizado por</Label>
            <Select value={formData.ensaio_realizado_por || "Afirma Evias"} onValueChange={(v) => set({ ensaio_realizado_por: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                <SelectItem value="Empreiteira">Empreiteira</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Inspetor Campo</Label>
            <Input value={formData.inspetor_campo} onChange={(e) => set({ inspetor_campo: e.target.value })} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}