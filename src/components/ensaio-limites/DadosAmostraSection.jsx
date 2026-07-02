import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fieldCls = 'h-8 text-xs border-border/30';

export function DadosAmostraSection({
  data, amostraTotalSecaAuto, soloSecoRetido10, soloUmPassando10, sp10, amostraTotalSecaCalc, onSet
}) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Dados da Amostra — Peneiramento Grosso</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-[10px] text-foreground">Amostra Total Úmida — Uₜ (g)</Label>
          <Input className={fieldCls} type="number" step="0.001" value={data.amostra_total_umida || ''} onChange={e => onSet('amostra_total_umida', e.target.value)} />
        </div>
        <div>
          <Label className="text-[10px] text-foreground">Amostra Total Seca — Sₜ (calculado: Uₜ/(1+H%))</Label>
          <div className="h-8 text-xs border border-border/20 rounded-md bg-gray-100/40 flex items-center px-2 text-gray-500 font-semibold">
            {amostraTotalSecaAuto != null ? amostraTotalSecaAuto.toFixed(3) : '-'}
          </div>
        </div>
        {[
          { label: 'Solo Seco Retido na #Nº10 — SR₁₀ (g)', value: soloSecoRetido10 },
          { label: 'Solo Úmido Passando na #Nº10 (g)', value: soloUmPassando10 },
          { label: 'Solo Seco Passando na #Nº10 — SP₁₀ (g)', value: sp10 },
          { label: 'Amostra Total Seca Calculada — SR₁₀+SP₁₀ (g)', value: amostraTotalSecaCalc },
        ].map(f => (
          <div key={f.label}>
            <Label className="text-[10px] text-foreground">{f.label}</Label>
            <div className="h-8 text-xs border border-border/20 rounded-md bg-gray-100/40 flex items-center px-2 text-gray-500 font-semibold">
              {f.value != null ? f.value.toFixed(2) : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}