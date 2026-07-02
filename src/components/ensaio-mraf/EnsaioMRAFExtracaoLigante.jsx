import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  { key: 'amostra_umida',       label: 'Amostra Úmida (g) *',                  required: true,  readOnly: false },
  { key: 'amostra_seca',        label: 'Amostra Seca (g) *',                   required: true,  readOnly: false },
  { key: 'umidade',             label: 'Umidade (%)',                           required: false, readOnly: true,  className: 'bg-muted' },
  { key: 'amostra_com_ligante', label: 'Amostra com Ligante (g)',               required: true,  readOnly: false, labelSuffix: true },
  { key: 'amostra_sem_ligante', label: 'Amostra sem Ligante (g)',               required: true,  readOnly: false, labelSuffix: true },
  { key: 'fator_correcao',      label: 'Fator de Correção',                     required: false, readOnly: false, defaultVal: 1.0 },
  { key: 'peso_ligante',        label: 'Peso do Ligante (g)',                   required: false, readOnly: true,  className: 'bg-muted' },
  { key: 'teor_ligante',        label: 'Teor de Ligante (%)',                   required: false, readOnly: true,  className: 'bg-muted' },
  { key: 'residuo_emulsao',     label: 'Resíduo da Emulsão (%)',                required: false, readOnly: false },
  { key: 'percentual_emulsao',  label: '% de Emulsão',                          required: false, readOnly: true,  className: 'bg-secondary/10 font-semibold' },
];

export default function EnsaioMRAFExtracaoLigante({
  ext, isEditable, isApproved, isFinalizado, onChange,
}) {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg">Extração de Ligante (Rotarex) *</CardTitle>
        <CardDescription>DNIT 427/20 - ABNT NBR 15619/16</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map(f => {
            const val = ext[f.key];
            const showRequired = f.required && isFinalizado;
            const label = f.labelSuffix
              ? `${f.label.replace(' *', '')}${isFinalizado ? ' *' : ''}`
              : f.label;
            return (
              <div key={f.key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={val || (f.defaultVal ?? '')}
                  onChange={f.readOnly ? undefined : (e) =>
                    onChange(f.key, e.target.value ? parseFloat(e.target.value) : (f.defaultVal ?? null))
                  }
                  readOnly={f.readOnly}
                  disabled={!f.readOnly && (!isEditable || isApproved)}
                  required={showRequired && !f.readOnly}
                  className={f.className || ''}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}