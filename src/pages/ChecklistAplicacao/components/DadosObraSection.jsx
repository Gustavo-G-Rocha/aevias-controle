/**
 * DadosObraSection.jsx — ChecklistAplicacao
 *
 * Seção de dados da obra do Checklist de Aplicação.
 * Campos: obra, projeto, data, jornada, rodovia, trecho,
 * empreiteira, usina, ligante, pedreira, ensaio realizado por.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DadosObraSection({
  formData,
  obras,
  projetosDisponiveis,
  obraSelecionada,
  selectedProject,
  isEditable,
  onChange,
  onNestedChange,
}) {

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Dados da Obra</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        <div>
          <Label>Obra *</Label>
          <Select value={formData.obra_id} onValueChange={(v) => onChange('obra_id', v)}
            disabled={!isEditable || obras.length === 0}>
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name} ({o.code})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Projeto Vinculado *</Label>
          <Select value={formData.project_id} onValueChange={(v) => onChange('project_id', v)}
            disabled={!isEditable || !formData.obra_id || projetosDisponiveis.length === 0}>
            <SelectTrigger><SelectValue placeholder="Selecione um projeto" /></SelectTrigger>
            <SelectContent>
              {projetosDisponiveis.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data">Data *</Label>
          <Input id="data" type="date" value={formData.data}
            onChange={(e) => onChange('data', e.target.value)}
            disabled={!isEditable} required />
        </div>

        <div>
          <Label>Horário Início *</Label>
          <Input type="time" value={formData.jornada?.horario_inicio || ""}
            onChange={(e) => onNestedChange('jornada', 'horario_inicio', e.target.value)}
            disabled={!isEditable} required />
        </div>

        <div>
          <Label>Horário Fim *</Label>
          <Input type="time" value={formData.jornada?.horario_fim || ""}
            onChange={(e) => onNestedChange('jornada', 'horario_fim', e.target.value)}
            disabled={!isEditable} required />
        </div>

        <div>
          <Label>Rodovia *</Label>
          <Select value={formData.rodovia} onValueChange={(v) => onChange('rodovia', v)}
            disabled={!isEditable || !formData.obra_id} required>
            <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
            <SelectContent>
              {(obraSelecionada?.rodovias || []).map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Trecho *</Label>
          <Input value={formData.trecho} onChange={(e) => onChange('trecho', e.target.value)}
            disabled={!isEditable} placeholder="Ex: km 10 ao km 25" required />
        </div>

        <div>
          <Label>Empreiteira *</Label>
          <Select value={formData.empreiteira} onValueChange={(v) => onChange('empreiteira', v)}
            disabled={!isEditable || !formData.obra_id} required>
            <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
            <SelectContent>
              {(obraSelecionada?.empreiteiras || []).map((em) => (
                <SelectItem key={em} value={em}>{em}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Usina *</Label>
          <Select value={formData.usina} onValueChange={(v) => onChange('usina', v)}
            disabled={!isEditable || !formData.obra_id} required>
            <SelectTrigger><SelectValue placeholder="Selecione a usina" /></SelectTrigger>
            <SelectContent>
              {(obraSelecionada?.usinas || []).map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ligante *</Label>
          <Input value={formData.ligante} onChange={(e) => onChange('ligante', e.target.value)}
            disabled={!isEditable} readOnly={!!selectedProject}
            className={selectedProject ? "bg-muted" : ""}
            placeholder="Tipo de ligante" required />
        </div>

        <div>
          <Label>Pedreira *</Label>
          <Input value={formData.pedreira} onChange={(e) => onChange('pedreira', e.target.value)}
            disabled={!isEditable} readOnly={!!selectedProject}
            className={selectedProject ? "bg-muted" : ""}
            placeholder="Nome da pedreira" required />
        </div>

        <div>
          <Label>Ensaio realizado por *</Label>
          <Select value={formData.ensaio_realizado_por} onValueChange={(v) => onChange('ensaio_realizado_por', v)}
            disabled={!isEditable} required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
              <SelectItem value="Empreiteira">Empreiteira</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}