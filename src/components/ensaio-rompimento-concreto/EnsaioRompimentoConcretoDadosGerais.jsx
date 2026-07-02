import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ── Shared local primitives ───────────────────────────────────────────────────
const LabeledField = ({ id, label, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium mb-2">{label}</label>
    {React.cloneElement(children, { id })}
  </div>
);

export default function EnsaioRompimentoConcretoDadosGerais({
  formData, obras, projects, isSupervisao, rodoviasDaObra, empreiteirasObra, projectsDaObra,
  onFieldChange, onObraChange,
}) {
  return (
    <div className="space-y-6">
      {/* Dados do Cliente */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LabeledField id="obra_id" label="Obra*">
              <select
                value={formData.obra_id}
                onChange={(e) => onObraChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input "
              >
                <option value="">Selecionar obra...</option>
                {obras.map(obra => <option key={obra.id} value={obra.id}>{obra.name}</option>)}
              </select>
            </LabeledField>

            <LabeledField id="rodovia" label="Rodovia">
              <select
                value={formData.rodovia}
                onChange={(e) => onFieldChange('rodovia', e.target.value)}
                disabled={!formData.obra_id}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input  disabled:opacity-50"
              >
                <option value="">Selecionar...</option>
                {rodoviasDaObra.map(rod => <option key={rod} value={rod}>{rod}</option>)}
              </select>
            </LabeledField>

            <LabeledField id="fornecedor" label="Fornecedor">
              <Input
                value={formData.fornecedor}
                onChange={(e) => onFieldChange('fornecedor', e.target.value)}
                placeholder="Nome do fornecedor"
                className="bg-input border-border "
              />
            </LabeledField>

            <LabeledField id="project_id" label="Carta Traço*">
              <select
                value={formData.project_id}
                onChange={(e) => onFieldChange('project_id', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input "
              >
                <option value="">Selecionar...</option>
                {projectsDaObra.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
              </select>
            </LabeledField>

            <LabeledField id="cliente" label="Cliente">
              <Input value={formData.cliente} readOnly className="bg-input border-border  opacity-70 cursor-not-allowed" />
            </LabeledField>

            <LabeledField id="volume_betonado" label="Volume Betonado (m³)">
              <Input type="number" value={formData.volume_betonado} onChange={(e) => onFieldChange('volume_betonado', e.target.value)} className="bg-input border-border " />
            </LabeledField>

            <LabeledField id="hora_moldagem" label="Hora Moldagem">
              <Input type="time" value={formData.hora_moldagem} onChange={(e) => onFieldChange('hora_moldagem', e.target.value)} className="bg-input border-border " />
            </LabeledField>

            <LabeledField id="laboratorista_name" label="Laboratorista">
              <Input value={formData.laboratorista_name} disabled className="bg-input border-border text-muted-foreground" />
            </LabeledField>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Ensaio */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="">Dados do Ensaio</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LabeledField id="trecho" label="Trecho">
              <Input value={formData.trecho} onChange={(e) => onFieldChange('trecho', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="numero_moldagem" label="Número Moldagem">
              <Input value={formData.numero_moldagem} onChange={(e) => onFieldChange('numero_moldagem', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="estrutura" label="Estrutura">
              <Input value={formData.estrutura} onChange={(e) => onFieldChange('estrutura', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="construtora" label="Construtora">
              {isSupervisao ? (
                <select
                  value={formData.construtora}
                  onChange={(e) => onFieldChange('construtora', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input "
                >
                  <option value="">Selecionar empreiteira...</option>
                  {empreiteirasObra.map((emp, idx) => <option key={idx} value={emp}>{emp}</option>)}
                </select>
              ) : (
                <Input value={formData.construtora} readOnly className="bg-input border-border  opacity-70 cursor-not-allowed" />
              )}
            </LabeledField>
            <LabeledField id="nota_fiscal" label="Nota Fiscal">
              <Input value={formData.nota_fiscal} onChange={(e) => onFieldChange('nota_fiscal', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="estaca_moldagem" label="Estaca Moldagem">
              <Input value={formData.estaca_moldagem} onChange={(e) => onFieldChange('estaca_moldagem', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="slump_test" label="Slump Test (mm)">
              <Input type="number" value={formData.slump_test} onChange={(e) => onFieldChange('slump_test', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="temperatura_ambiente" label="Temperatura Ambiente (°C)">
              <Input type="number" value={formData.temperatura_ambiente} onChange={(e) => onFieldChange('temperatura_ambiente', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="hora_saida_usina" label="Hora Saída Usina">
              <Input type="time" value={formData.hora_saida_usina} onChange={(e) => onFieldChange('hora_saida_usina', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="hora_chegada_campo" label="Hora Chegada Campo">
              <Input type="time" value={formData.hora_chegada_campo} onChange={(e) => onFieldChange('hora_chegada_campo', e.target.value)} className="bg-input border-border " />
            </LabeledField>
            <LabeledField id="data_ensaio" label="Data do Ensaio">
              <Input type="date" value={formData.data_ensaio} onChange={(e) => onFieldChange('data_ensaio', e.target.value)} className="bg-input border-border " />
            </LabeledField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}