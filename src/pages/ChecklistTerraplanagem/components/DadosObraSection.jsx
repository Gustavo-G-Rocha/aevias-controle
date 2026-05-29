import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DadosObraSection({ formData, setFormData, obras, obraSelecionada, editingChecklist }) {
  const set = (patch) => setFormData(prev => ({ ...prev, ...patch }));
  const setJornada = (patch) => setFormData(prev => ({ ...prev, jornada: { ...prev.jornada, ...patch } }));

  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-lg">Dados da Obra</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={(v) => set({ obra_id: v })} disabled={!!editingChecklist?.id}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.name} - {obra.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <Label>Rodovia *</Label>
            <Select value={formData.rodovia} onValueChange={(v) => set({ rodovia: v })} disabled={!formData.obra_id}>
              <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent>
                {(obraSelecionada?.rodovias || []).map((r, i) => <SelectItem key={i} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Empreiteira *</Label>
            <Select value={formData.empreiteira} onValueChange={(v) => set({ empreiteira: v })} disabled={!formData.obra_id}>
              <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
              <SelectContent>
                {(obraSelecionada?.empreiteiras || []).map((e, i) => <SelectItem key={i} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estaca *</Label>
            <Input value={formData.estaca} onChange={(e) => set({ estaca: e.target.value })} placeholder="Ex: km 10+500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Camada *</Label>
            <Input value={formData.camada} onChange={(e) => set({ camada: e.target.value })} placeholder="Ex: Subleito, Sub-base, Base" />
          </div>
          <div>
            <Label>Material *</Label>
            <Input value={formData.material} onChange={(e) => set({ material: e.target.value })} placeholder="Material utilizado" />
          </div>
          <div>
            <Label>Local de origem do material</Label>
            <Input value={formData.origem_material || ""} onChange={(e) => set({ origem_material: e.target.value })} placeholder="Ex: Jazida km 15, Bota-fora A" />
          </div>
          <div>
            <Label>Nome do material</Label>
            <Input value={formData.nome_material || ""} onChange={(e) => set({ nome_material: e.target.value })} placeholder="Ex: Solo argiloso, Brita 0, Macadame" />
          </div>
          <div>
            <Label>Inspetor Fiscal</Label>
            <Input value={formData.inspetor_fiscal} onChange={(e) => set({ inspetor_fiscal: e.target.value })} />
          </div>
          <div>
            <Label>Ensaio realizado por:</Label>
            <Select value={formData.ensaio_realizado_por} onValueChange={(v) => set({ ensaio_realizado_por: v })}>
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