import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function EnsaioTaxaMRAFDadosGerais({
  formData,
  obras,
  isEditable,
  onFieldChange
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#00233B] mb-4">Dados da Obra</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Obra *</Label>
          <select
            value={formData.obra_id}
            onChange={e => onFieldChange('obra_id', e.target.value)}
            disabled={!isEditable}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecione a obra</option>
            {obras.map(o => <option key={o.id} value={o.id}>{o.name} - {o.code}</option>)}
          </select>
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
          <select
            value={formData.rodovia}
            onChange={e => onFieldChange('rodovia', e.target.value)}
            disabled={!isEditable}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecione a rodovia</option>
            {obras.find(o => o.id === formData.obra_id)?.rodovias?.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
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
          <select
            value={formData.ensaio_realizado_por}
            onChange={e => onFieldChange('ensaio_realizado_por', e.target.value)}
            disabled={!isEditable}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecione</option>
            <option value="Afirma Evias">Afirma Evias</option>
            <option value="Empreiteira">Empreiteira</option>
          </select>
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
            className="bg-white"
          />
        </div>
        <div>
          <Label>Laboratorista</Label>
          <Input value={formData.laboratorista_name} readOnly className="bg-slate-100" />
        </div>
      </div>
    </div>
  );
}