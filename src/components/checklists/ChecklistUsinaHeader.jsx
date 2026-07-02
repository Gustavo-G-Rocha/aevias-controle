import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChecklistUsinaHeader({
  formData,
  setFormData,
  obras,
  regionais,
  projetosDisponiveis,
  obraSelecionada,
  regionalSelecionada,
  isEditable,
  isApproved,
  editingChecklist,
  onObraChange,
  onProjectChange,
}) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-4"><CardTitle className="text-xl">Dados da Obra e Projeto</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className="text-base">Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={onObraChange}
              disabled={!isEditable || isApproved || !!editingChecklist?.id}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {(obras || []).map(obra => {
                  const regional = (regionais || []).find(r => r.id === obra.regional_id);
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
            <Select value={formData.project_id || ""} onValueChange={onProjectChange}
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
              required disabled={!isEditable || isApproved} className="bg-card border-border text-foreground h-11 text-base" />
          </div>
        </div>

        {regionalSelecionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 text-sm">
            <p className="text-secondary"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
            {regionalSelecionada.cliente && (
              <p className="text-secondary"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className="text-base">Usina *</Label>
            <Select value={formData.usina || ""} onValueChange={(v) => handleChange('usina', v)}
              disabled={!isEditable || isApproved || !obraSelecionada}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a usina" /></SelectTrigger>
              <SelectContent>
                {(obraSelecionada?.usinas || []).map((u, i) => <SelectItem key={i} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base">Pedreira *</Label>
            <Input value={formData.pedreira || ""} onChange={(e) => handleChange('pedreira', e.target.value)}
              disabled={!isEditable || isApproved} required placeholder="Nome da pedreira"
              className="bg-card border-border text-foreground h-11 text-base" />
          </div>
          <div>
            <Label className="text-base">Ligante Asfáltico *</Label>
            <Input value={formData.ligante || ""} onChange={(e) => handleChange('ligante', e.target.value)}
              disabled={!isEditable || isApproved} required placeholder="Ex: CAP 50-70"
              className="bg-card border-border text-foreground h-11 text-base" />
          </div>
        </div>
      </CardContent>
    </Card>
  );





















































































































































}