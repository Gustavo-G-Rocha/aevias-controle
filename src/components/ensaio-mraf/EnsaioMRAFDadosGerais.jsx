import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EnsaioMRAFDadosGerais({
  formData,
  obras, regionais, projetosMRAF,
  rodoviasDisponiveis, selectedProject,
  isEditable, isApproved,
  handleChange, handleProjectChange,
  editingEnsaio, regionalSelecionada,
}) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <Select value={formData.obra_id} onValueChange={(v) => handleChange('obra_id', v)} disabled={!isEditable || isApproved || !!editingEnsaio?.id}>
              <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent title="Obra">
                {obras.map(obra => {
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
            <Label htmlFor="project_id">Projeto MRAF</Label>
            <Select value={formData.project_id} onValueChange={handleProjectChange} disabled={!isEditable || isApproved || !formData.obra_id}>
              <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione um projeto" /></SelectTrigger>
              <SelectContent title="Projeto MRAF">
                {projetosMRAF.map(proj => (
                  <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {regionalSelecionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="space-y-0.5 text-sm">
              <p className="text-secondary"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
              {regionalSelecionada.cliente && (
                <p className="text-secondary"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="data_ensaio">Data *</Label>
            <Input
              id="data_ensaio"
              type="date"
              value={formData.data_ensaio}
              onChange={(e) => handleChange('data_ensaio', e.target.value)}
              required={formData.status === 'finalizado'}
              disabled={!isEditable || isApproved}
            />
          </div>
          <div>
            <Label htmlFor="horario">Horário</Label>
            <Input
              id="horario"
              type="time"
              value={formData.horario}
              onChange={(e) => handleChange('horario', e.target.value)}
              disabled={!isEditable || isApproved}
            />
          </div>
          <div>
            <Label htmlFor="placa_caminhao">Placa Caminhão</Label>
            <Input
              id="placa_caminhao"
              value={formData.placa_caminhao}
              onChange={(e) => handleChange('placa_caminhao', e.target.value)}
              disabled={!isEditable || isApproved}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rodovia">Rodovia</Label>
            {rodoviasDisponiveis.length > 0 ? (
              <Select value={formData.rodovia} onValueChange={(v) => handleChange('rodovia', v)} disabled={!isEditable || isApproved}>
                <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
                <SelectContent title="Rodovia">
                  {rodoviasDisponiveis.map((rodovia, idx) => (
                    <SelectItem key={idx} value={rodovia}>{rodovia}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="rodovia"
                value={formData.rodovia}
                onChange={(e) => handleChange('rodovia', e.target.value)}
                disabled={!isEditable || isApproved}
                placeholder={formData.obra_id ? "Nenhuma rodovia cadastrada na obra" : "Selecione a obra primeiro"}
              />
            )}
          </div>
          <div>
            <Label htmlFor="trecho">Trecho</Label>
            <Input
              id="trecho"
              value={formData.trecho}
              onChange={(e) => handleChange('trecho', e.target.value)}
              disabled={!isEditable || isApproved}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="local_coleta">Local de Coleta</Label>
          <Input
            id="local_coleta"
            value={formData.local_coleta}
            onChange={(e) => handleChange('local_coleta', e.target.value)}
            disabled={!isEditable || isApproved}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pedreira">Pedreira</Label>
            <Input
              id="pedreira"
              value={formData.pedreira}
              onChange={(e) => handleChange('pedreira', e.target.value)}
              disabled={!isEditable || isApproved}
            />
          </div>
          <div>
            <Label htmlFor="faixa_especificada">Faixa Especificada</Label>
            <Input
              id="faixa_especificada"
              value={formData.faixa_especificada}
              onChange={(e) => handleChange('faixa_especificada', e.target.value)}
              disabled={!isEditable || isApproved}
              readOnly={!!selectedProject}
              className={selectedProject ? "bg-muted" : ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tipo_ligante">Tipo de Ligante</Label>
            <Input
              id="tipo_ligante"
              value={formData.tipo_ligante}
              onChange={(e) => handleChange('tipo_ligante', e.target.value)}
              disabled={!isEditable || isApproved}
              readOnly={!!selectedProject}
              className={selectedProject ? "bg-muted" : ""}
            />
          </div>
          <div>
            <Label htmlFor="ensaio_realizado_por">Ensaio realizado por:</Label>
            <Select value={formData.ensaio_realizado_por} onValueChange={(v) => handleChange('ensaio_realizado_por', v)} disabled={!isEditable || isApproved}>
              <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent title="Ensaio realizado por">
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