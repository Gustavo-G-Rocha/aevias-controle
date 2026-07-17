import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EnsaioTaxaMRAFDadosGerais({
  formData,
  obras,
  isEditable,
  onFieldChange
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Dados da Obra</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Obra *</Label>
          <Select
            value={formData.obra_id || ""}
            onValueChange={value => onFieldChange('obra_id', value)}
            disabled={!isEditable}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a obra" />
            </SelectTrigger>
            <SelectContent title="Selecione a obra">
              {obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Data do Ensaio *</Label>
          <Input
            type="date"
            value={formData.data_ensaio}
            onChange={e => onFieldChange('data_ensaio', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Placa Caminhão</Label>
          <Input
            value={formData.placa_caminhao}
            onChange={e => onFieldChange('placa_caminhao', e.target.value)}
            disabled={!isEditable}
            placeholder="Ex: ABC-1234"
          />
        </div>
        <div>
          <Label>Rodovia</Label>
          <Select
            value={formData.rodovia || ""}
            onValueChange={value => onFieldChange('rodovia', value)}
            disabled={!isEditable}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a rodovia" />
            </SelectTrigger>
            <SelectContent title="Selecione a rodovia">
              {obras.find(o => o.id === formData.obra_id)?.rodovias?.map((r, i) => (
                <SelectItem key={i} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trecho</Label>
          <Input
            value={formData.trecho}
            onChange={e => onFieldChange('trecho', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Material</Label>
          <Input
            value={formData.material}
            onChange={e => onFieldChange('material', e.target.value)}
            disabled={!isEditable}
            placeholder="Ex: MRAF"
          />
        </div>
        <div>
          <Label>Nº do Projeto</Label>
          <Input
            value={formData.numero_projeto}
            onChange={e => onFieldChange('numero_projeto', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Empreiteira</Label>
          <Input
            value={formData.empreiteira}
            onChange={e => onFieldChange('empreiteira', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Usina</Label>
          <Input
            value={formData.usina}
            onChange={e => onFieldChange('usina', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Faixa Especificada</Label>
          <Input
            value={formData.faixa_especificada}
            onChange={e => onFieldChange('faixa_especificada', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Ligante</Label>
          <Input
            value={formData.ligante}
            onChange={e => onFieldChange('ligante', e.target.value)}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label>Ensaio Realizado Por</Label>
          <Select
            value={formData.ensaio_realizado_por || ""}
            onValueChange={value => onFieldChange('ensaio_realizado_por', value)}
            disabled={!isEditable}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent title="Ensaio Realizado Por">
              <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
              <SelectItem value="Empreiteira">Empreiteira</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Taxa Mínima do Projeto (kg/m²)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.taxa_minima_projeto ?? ''}
            onChange={e => onFieldChange('taxa_minima_projeto', e.target.value ? parseFloat(e.target.value) : null)}
            disabled={!isEditable}
            placeholder="Ex: 12.0"
            className="bg-background"
          />
        </div>
        <div>
          <Label>Laboratorista</Label>
          <Input value={formData.laboratorista_name} readOnly className="bg-muted" />
        </div>
      </div>
    </div>
  );
}