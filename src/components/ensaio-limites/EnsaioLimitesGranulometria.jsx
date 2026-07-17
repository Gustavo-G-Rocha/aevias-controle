import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PENEIRAS_GROSSAS, PENEIRAS_FINAS } from '@/utils/ensaioLimitesConstantes';

const fieldCls = 'h-8 text-xs border-border/30';
const thCls = 'border border-border/20 px-2 py-1.5 text-left font-semibold text-foreground text-[10px] bg-muted/8';
const tdCls = 'border border-border/20 px-1 py-0.5';
const tdCalcCls = 'border border-border/20 px-2 py-1 text-center text-[10px] font-semibold text-gray-500 bg-muted/40';

export function HigroUmidadeSection({ data, higroTeor1, higroTeor2, higroTeorMedia, onSet }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Umidade Higroscópica</p>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/8">
            <th className={thCls}>Campo</th>
            <th className={thCls + ' text-center'}>Am. 1</th>
            <th className={thCls + ' text-center'}>Am. 2</th>
            <th className={thCls + ' text-center'}>Média</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Solo Úmido+Cápsula (g)', f1: 'higro_solo_umido_capsula_1', f2: 'higro_solo_umido_capsula_2' },
            { label: 'Solo Seco+Cápsula (g)', f1: 'higro_solo_seco_capsula_1', f2: 'higro_solo_seco_capsula_2' },
            { label: 'Peso da Cápsula (g)', f1: 'higro_peso_capsula_1', f2: 'higro_peso_capsula_2' },
          ].map(row => (
            <tr key={row.f1} className="bg-card/10">
              <td className={tdCls + ' text-[10px] text-foreground'}>{row.label}</td>
              <td className={tdCls}><Input className={fieldCls} type="number" step="0.001" value={data[row.f1] || ''} onChange={e => onSet(row.f1, e.target.value)} /></td>
              <td className={tdCls}><Input className={fieldCls} type="number" step="0.001" value={data[row.f2] || ''} onChange={e => onSet(row.f2, e.target.value)} /></td>
              <td className={tdCalcCls}>-</td>
            </tr>
          ))}
          <tr className="bg-muted/30">
            <td className={tdCls + ' text-[10px] text-foreground'}>Teor de Umidade (%)</td>
            <td className={tdCalcCls}>{higroTeor1 != null ? higroTeor1.toFixed(2) : '-'}</td>
            <td className={tdCalcCls}>{higroTeor2 != null ? higroTeor2.toFixed(2) : '-'}</td>
            <td className={tdCalcCls}>{higroTeorMedia != null ? higroTeorMedia.toFixed(2) : '-'}</td>
          </tr>
          <tr className="bg-secondary/20/20 font-bold">
            <td className={tdCls + ' text-[10px] text-foreground font-bold'}>Umidade Média — H (%)</td>
            <td colSpan={3} className={tdCalcCls + ' font-bold text-foreground'}>{higroTeorMedia != null ? higroTeorMedia.toFixed(2) : '-'}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function PeneiramentoGrossoSection({ data, granGrossaCalc, onSetNested }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Peneiramento Grosso</p>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/8">
            <th className={thCls}>Peneira</th><th className={thCls}>mm</th><th className={thCls}>Retido (g)</th><th className={thCls}>Passando (g)</th><th className={thCls}>Total Pass.(%)</th>
          </tr>
        </thead>
        <tbody>
          {(data.peneiras_grossas || PENEIRAS_GROSSAS.map(p => ({ ...p, retido: '' }))).map((pen, i) => (
            <tr key={i} className="bg-card/10">
              <td className={tdCls + ' text-[10px] text-foreground font-medium'}>{pen.label}</td>
              <td className={tdCls + ' text-[10px] text-center text-gray-500'}>{pen.mm}</td>
              <td className={tdCls}><Input className={fieldCls} type="number" step="0.001" value={pen.retido || ''} onChange={e => onSetNested('peneiras_grossas', i, 'retido', e.target.value)} /></td>
              <td className={tdCalcCls}>{granGrossaCalc[i]?.passando != null ? granGrossaCalc[i].passando.toFixed(3) : '-'}</td>
              <td className={tdCalcCls}>{granGrossaCalc[i]?.passPct != null ? granGrossaCalc[i].passPct.toFixed(1) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function PeneiramentoFinoSection({ data, granFinaCalc, sp10, amostraTotalSeca, onSet, onSetNested }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Peneiramento Fino</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label className="text-[10px] text-foreground">Amostra Parcial Úmida (Up)</Label>
          <Input className={fieldCls} type="number" step="0.001" value={data.amostra_parcial_umida || ''} onChange={e => onSet('amostra_parcial_umida', e.target.value)} />
        </div>
        <div>
          <Label className="text-[10px] text-foreground">Amostra Parcial Seca (calculado: Up/(H+100))</Label>
          <Input className={fieldCls} type="number" step="0.001" value={data.amostra_parcial_seca || ''} onChange={e => onSet('amostra_parcial_seca', e.target.value)} />
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/8">
            <th className={thCls}>Peneira Nº</th><th className={thCls}>mm</th><th className={thCls}>Retido (g)</th><th className={thCls}>Pass. (g)</th><th className={thCls}>Pass. (%)</th><th className={thCls}>% Total Pass.</th>
          </tr>
        </thead>
        <tbody>
          {(data.peneiras_finas || PENEIRAS_FINAS.map(p => ({ ...p, retido: '' }))).map((pen, i) => {
            const totalPasePct = granFinaCalc[i]?.passPct != null && sp10 != null && amostraTotalSeca != null && amostraTotalSeca > 0
              ? parseFloat((granFinaCalc[i].passPct * (sp10 / amostraTotalSeca)).toFixed(1))
              : null;
            return (
              <tr key={i} className="bg-card/10">
                <td className={tdCls + ' text-[10px] text-foreground font-medium'}>{pen.label}</td>
                <td className={tdCls + ' text-[10px] text-center text-gray-500'}>{pen.mm}</td>
                <td className={tdCls}><Input className={fieldCls} type="number" step="0.001" value={pen.retido || ''} onChange={e => onSetNested('peneiras_finas', i, 'retido', e.target.value)} /></td>
                <td className={tdCalcCls}>{granFinaCalc[i]?.passando != null ? granFinaCalc[i].passando.toFixed(3) : '-'}</td>
                <td className={tdCalcCls}>{granFinaCalc[i]?.passPct != null ? granFinaCalc[i].passPct.toFixed(1) : '-'}</td>
                <td className={tdCalcCls}>{totalPasePct != null ? totalPasePct.toFixed(1) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}