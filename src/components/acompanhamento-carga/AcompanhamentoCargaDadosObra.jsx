import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AcompanhamentoCargaDadosObra({
  formData, setFormData,
  obras, availableProjects,
  obraSelecionada, regionalSelecionada, projetoSelecionado,
  canEdit,
  handleObraChange, handleProjectChange,
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4 border-b pb-2">DADOS DA OBRA</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Cliente (Automático)</Label>
          <Input value={regionalSelecionada?.cliente || ""} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Trecho *</Label>
          <Input
            value={formData.trecho}
            onChange={(e) => setFormData(prev => ({ ...prev, trecho: e.target.value }))}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>N° do Projeto</Label>
          <Select
            value={formData.project_id}
            onValueChange={handleProjectChange}
            disabled={!canEdit || !formData.obra_id}
          >
            <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
            <SelectContent>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Rodovia *</Label>
          <Select
            value={formData.rodovia}
            onValueChange={(value) => setFormData(prev => ({ ...prev, rodovia: value }))}
            disabled={!canEdit || !formData.obra_id}
          >
            <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
            <SelectContent>
              {obraSelecionada?.rodovias?.map((rodovia) => (
                <SelectItem key={rodovia} value={rodovia}>{rodovia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sub-trecho</Label>
          <Input
            value={formData.sub_trecho}
            onChange={(e) => setFormData(prev => ({ ...prev, sub_trecho: e.target.value }))}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Laboratorista (Automático)</Label>
          <Input value={formData.laboratorista_name} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Obra *</Label>
          <Select
            value={formData.obra_id}
            onValueChange={handleObraChange}
            disabled={!canEdit}
          >
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map((obra) => (
                <SelectItem key={obra.id} value={obra.id}>
                  {obra.name} ({obra.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Usina Fornecedora</Label>
          <Select
            value={formData.usina_fornecedora}
            onValueChange={(value) => setFormData(prev => ({ ...prev, usina_fornecedora: value }))}
            disabled={!canEdit || !formData.obra_id}
          >
            <SelectTrigger><SelectValue placeholder="Selecione a usina" /></SelectTrigger>
            <SelectContent>
              {obraSelecionada?.usinas?.map((usina) => (
                <SelectItem key={usina} value={usina}>{usina}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Data *</Label>
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Serviço *</Label>
          <Select
            value={formData.servico}
            onValueChange={(value) => setFormData(prev => ({ ...prev, servico: value }))}
            disabled={!canEdit}
          >
            <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="remendos">Remendos</SelectItem>
              <SelectItem value="capa_reperfilagem">Capa/Reperfilagem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Faixa Especificada (Automático)</Label>
          <Input
            value={projetoSelecionado?.faixa_granulometrica_id || ""}
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      {/* Jornada de Trabalho */}
      <div className="mt-6">
        <h3 className="text-md font-semibold text-foreground mb-3">Jornada de Trabalho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Horário de Início</Label>
            <Input
              type="time"
              value={formData.jornada?.horario_inicio || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                jornada: { ...prev.jornada, horario_inicio: e.target.value }
              }))}
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label>Horário de Fim</Label>
            <Input
              type="time"
              value={formData.jornada?.horario_fim || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                jornada: { ...prev.jornada, horario_fim: e.target.value }
              }))}
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}