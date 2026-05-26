import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AcompanhamentoUsinagemDadosObra({
  formData, setFormData,
  obras, filteredProjects,
  isEditable,
  handleObraChange, handleProjectChange,
}) {
  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-[#00233B]">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <Select value={formData.obra_id} onValueChange={handleObraChange} disabled={!isEditable}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.name} - {obra.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="project_id">Projeto</Label>
            <Select value={formData.project_id} onValueChange={handleProjectChange}
              disabled={!isEditable || !formData.obra_id}>
              <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
              <SelectContent>
                {filteredProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data">Data *</Label>
            <Input id="data" type="date" value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              disabled={!isEditable} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rodovia">Rodovia</Label>
            <Input id="rodovia" value={formData.rodovia}
              onChange={(e) => setFormData(prev => ({ ...prev, rodovia: e.target.value }))}
              disabled={!isEditable} />
          </div>
          <div>
            <Label htmlFor="trecho">Trecho</Label>
            <Input id="trecho" value={formData.trecho}
              onChange={(e) => setFormData(prev => ({ ...prev, trecho: e.target.value }))}
              disabled={!isEditable} />
          </div>
          <div>
            <Label htmlFor="usina">Usina</Label>
            <Input id="usina" value={formData.usina}
              onChange={(e) => setFormData(prev => ({ ...prev, usina: e.target.value }))}
              disabled={!isEditable} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="pedreira">Pedreira</Label>
            <Input id="pedreira" value={formData.pedreira}
              onChange={(e) => setFormData(prev => ({ ...prev, pedreira: e.target.value }))}
              disabled={!isEditable} />
          </div>
          <div>
            <Label htmlFor="numero_projeto">N° Projeto</Label>
            <Input id="numero_projeto" value={formData.numero_projeto}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_projeto: e.target.value }))}
              disabled={!isEditable} />
          </div>
          <div>
            <Label htmlFor="faixa_especificada">Faixa Especificada</Label>
            <Input id="faixa_especificada" value={formData.faixa_especificada}
              onChange={(e) => setFormData(prev => ({ ...prev, faixa_especificada: e.target.value }))}
              disabled className="bg-gray-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}