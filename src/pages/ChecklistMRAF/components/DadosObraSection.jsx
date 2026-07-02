import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DadosObraSection({
  formData, setFormData,
  obras, regionais, obraSelecionada, regionalSelecionada,
  projetosDisponiveis, selectedProject,
  isEditable, isApproved, editingChecklist,
  handleChange, handleObraChange, handleProjectChange,
}) {
  return (
    <Card>
      <CardHeader className="pb-4"><CardTitle className="text-xl">Dados da Obra e Projeto</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className="text-base">Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={handleObraChange}
              disabled={!isEditable || isApproved || editingChecklist?.id}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {(obras || []).map(obra => {
                  const regional = regionais.find(r => r.id === obra.regional_id);
                  return (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.name} - {obra.code} {regional && `(${regional.nome})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base">Projeto Vinculado *</Label>
            <Select value={formData.project_id || ""} onValueChange={handleProjectChange}
              disabled={!isEditable || isApproved || !formData.obra_id}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione um projeto" /></SelectTrigger>
              <SelectContent>
                {(projetosDisponiveis || []).map(proj => (
                  <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base">Data *</Label>
            <Input type="date" value={formData.data} onChange={(e) => handleChange('data', e.target.value)}
              required disabled={!isEditable || isApproved} className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label className="text-base">Horário Início *</Label>
            <Input type="time" value={formData.jornada?.horario_inicio || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, jornada: { ...prev.jornada, horario_inicio: e.target.value } }))}
              disabled={!isEditable || isApproved} required className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
          </div>
          <div>
            <Label className="text-base">Horário Fim *</Label>
            <Input type="time" value={formData.jornada?.horario_fim || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, jornada: { ...prev.jornada, horario_fim: e.target.value } }))}
              disabled={!isEditable || isApproved} required className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
          </div>
        </div>

        {regionalSelecionada && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-1 text-sm">
            <p className="text-foreground"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
            {regionalSelecionada.cliente && (
              <p className="text-foreground"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className="text-base">Rodovia *</Label>
            <Select value={formData.rodovia || ""} onValueChange={(v) => handleChange('rodovia', v)}
              disabled={!isEditable || isApproved || !obraSelecionada}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent>
                {(obraSelecionada?.rodovias || []).map((r, i) => <SelectItem key={i} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base">Trecho *</Label>
            <Input value={formData.trecho} onChange={(e) => handleChange('trecho', e.target.value)}
              required disabled={!isEditable || isApproved} placeholder="Descrição do trecho"
              className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
          </div>
          <div>
            <Label className="text-base">Empreiteira *</Label>
            <Select value={formData.empreiteira || ""} onValueChange={(v) => handleChange('empreiteira', v)}
              disabled={!isEditable || isApproved || !obraSelecionada}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
              <SelectContent>
                {(obraSelecionada?.empreiteiras || []).map((e, i) => <SelectItem key={i} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base">Pedreira *</Label>
            <Input value={formData.pedreira} onChange={(e) => handleChange('pedreira', e.target.value)}
              disabled={!isEditable || isApproved} required placeholder="Nome da pedreira"
              className="bg-white border-slate-200 text-slate-700 h-11 text-base" />
          </div>
          <div>
            <Label className="text-base">Faixa Especificada</Label>
            <Input value={formData.faixa_especificada} onChange={(e) => handleChange('faixa_especificada', e.target.value)}
              disabled={!isEditable || isApproved} readOnly
              className="bg-slate-100 border-slate-200 text-slate-700 h-11 text-base" />
          </div>
          <div>
            <Label className="text-base">Ligante Asfáltico *</Label>
            <Input value={formData.ligante} onChange={(e) => handleChange('ligante', e.target.value)}
              disabled={!isEditable || isApproved} readOnly={!!selectedProject} required
              placeholder="Ex: Emulsão RL-1C"
              className={selectedProject ? "bg-slate-100 h-11 text-base" : "bg-white border-slate-200 text-slate-700 h-11 text-base"} />
          </div>
          <div>
            <Label className="text-base">Ensaio realizado por: *</Label>
            <Select value={formData.ensaio_realizado_por || ""} onValueChange={(v) => handleChange('ensaio_realizado_por', v)}
              disabled={!isEditable || isApproved}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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