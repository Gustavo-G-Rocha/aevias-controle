import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EnsaioGranIndividualDadosGerais({
  formData, obras, regionais, filteredProjects,
  obraSelecionada, isEditable, isApproved, editingEnsaio,
  handleChange,
}) {
  const regionalSelecionada = regionais.find(r => r.id === obraSelecionada?.regional_id);

  return (
    <Card className="bg-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tipo de Material */}
          <div>
            <Label>Tipo de Material *</Label>
            <Select
              value={formData.tipo_material}
              onValueChange={(value) => { handleChange('tipo_material', value); handleChange('project_id', ''); }}
              disabled={!isEditable || isApproved || !!editingEnsaio?.id}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CAUQ">CAUQ</SelectItem>
                <SelectItem value="MRAF">MRAF</SelectItem>
                <SelectItem value="BGS">BGS</SelectItem>
                <SelectItem value="CAMADAS_GRANULARES">Camadas Granulares</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Obra */}
          <div>
            <Label>Obra *</Label>
            <Select
              value={formData.obra_id}
              onValueChange={(value) => handleChange('obra_id', value)}
              disabled={!isEditable || isApproved || !!editingEnsaio?.id}
            >
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.name} - {obra.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Projeto */}
          {formData.tipo_material && (
            <div>
              <Label>Projeto</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleChange('project_id', value)}
                disabled={!isEditable || isApproved}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
                <SelectContent>
                  {filteredProjects.map(proj => (
                    <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Regional Info */}
          {regionalSelecionada && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="space-y-0.5 text-sm">
                <p className="text-blue-800"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
                {regionalSelecionada.cliente && (
                  <p className="text-blue-800"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Data / Horário / Rodovia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Data do Ensaio *</Label>
            <Input type="date" value={formData.data_ensaio}
              onChange={(e) => handleChange('data_ensaio', e.target.value)}
              disabled={!isEditable || isApproved} />
          </div>
          <div>
            <Label>Horário</Label>
            <Input type="time" value={formData.horario}
              onChange={(e) => handleChange('horario', e.target.value)}
              disabled={!isEditable || isApproved} />
          </div>
          <div>
            <Label>Rodovia</Label>
            <Select value={formData.rodovia} onValueChange={(v) => handleChange('rodovia', v)}
              disabled={!isEditable || isApproved}>
              <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent>
                {obraSelecionada?.rodovias?.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                )) || <SelectItem value={null} disabled>Nenhuma rodovia cadastrada</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pedreira / Faixa / Local */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Pedreira</Label>
            <Input value={formData.pedreira}
              onChange={(e) => handleChange('pedreira', e.target.value)}
              disabled={!isEditable || isApproved} />
          </div>
          <div>
            <Label>Faixa</Label>
            <Input value={formData.faixa}
              onChange={(e) => handleChange('faixa', e.target.value)}
              disabled={!isEditable || isApproved} />
          </div>
          <div>
            <Label>Local de Coleta</Label>
            <Input value={formData.local_coleta}
              onChange={(e) => handleChange('local_coleta', e.target.value)}
              disabled={!isEditable || isApproved} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}