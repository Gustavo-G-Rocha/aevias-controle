import React from 'react';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Scatter } from 'recharts';

const fieldCls = 'h-8 text-xs border-border/30';
const thCls = 'border border-border/20 px-2 py-1.5 text-left font-semibold text-foreground text-[10px] bg-muted/8';
const tdCls = 'border border-border/20 px-1 py-0.5';
const tdCalcCls = 'border border-border/20 px-2 py-1 text-center text-[10px] font-semibold text-gray-500 bg-muted/40';

export function LimiteLiquidezSection({ data, llCalc, llFit, llPoints, llYAxisDomain, llCurve, onSetNested }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Limite de Liquidez</p>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-muted/8">
            <th className={thCls}>Campo</th>
            {(data.ll_rows || []).map((_, i) => <th key={`ll-col-${i}`} className={thCls + ' text-center'}>#{i+1}</th>)}
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Nº Cápsula', field: 'numero_capsula', type: 'text' },
            { label: 'Solo Úm.+Cáps. (M₁, g)', field: 'solo_umido_capsula', type: 'number' },
            { label: 'Solo Sec.+Cáps. (M₂, g)', field: 'solo_seco_capsula', type: 'number' },
            { label: 'Peso Cápsula (Tʟ, g)', field: 'peso_capsula', type: 'number' },
          ].map(row => (
            <tr key={row.field} className="bg-card/10">
              <td className={tdCls + ' font-medium text-foreground'}>{row.label}</td>
              {(data.ll_rows || []).map((r, i) => (
                <td key={i} className={tdCls}>
                  <Input className={fieldCls} type={row.type} step="0.001"
                    value={r[row.field] || ''}
                    onChange={e => onSetNested('ll_rows', i, row.field, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-muted/40 font-bold">
            <td className={tdCls + ' font-bold text-foreground'}>Teor de Umidade (%)</td>
            {(data.ll_rows || []).map((_, i) => <td key={i} className={tdCalcCls + ' font-bold text-primary'}>{llCalc[i]?.teor != null ? llCalc[i].teor.toFixed(2) : '-'}</td>)}
          </tr>
          <tr className="bg-card/10">
            <td className={tdCls + ' font-medium text-foreground'}>Nº de Golpes</td>
            {(data.ll_rows || []).map((r, i) => (
              <td key={i} className={tdCls}>
                <Input className={fieldCls} type="number"
                  value={r.num_golpes || ''}
                  onChange={e => onSetNested('ll_rows', i, 'num_golpes', e.target.value)} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      </div>
      {llFit && (
        <div className="mt-1 text-center text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-1">
          LL (25 golpes) = {llFit.ll}%
        </div>
      )}
      {llPoints.length >= 2 && (
        <div className="mt-4">
          <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Gráfico do Limite de Liquidez</p>
          <div style={{ height: 286 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00233B20" />
                <XAxis dataKey="x" type="number"
                  label={{ value: 'Nº de Golpes', position: 'insideBottom', offset: -15, fill: '#00233B', fontSize: 11 }}
                  tick={{ fontSize: 10, fill: '#00233B' }} />
                <YAxis dataKey="y" type="number" domain={llYAxisDomain}
                  label={{ value: '% de Água', angle: -90, position: 'insideLeft', offset: 10, fill: '#00233B', fontSize: 11 }}
                  tick={{ fontSize: 10, fill: '#00233B' }} width={45} />
                <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
                {llCurve.length > 0 && (
                  <Line data={llCurve} dataKey="y" type="monotone" stroke="#00233B" strokeWidth={2} dot={false} isAnimationActive={false} name="Curva LL" />
                )}
                {llFit && (
                  <>
                    <Line data={[{ x: 25, y: 0 }, { x: 25, y: llFit.ll }]} dataKey="y" type="monotone" stroke="red" strokeDasharray="4 3" strokeWidth={1.5} dot={false} name="LL ref" />
                    <Line data={[{ x: 0, y: llFit.ll }, { x: 25, y: llFit.ll }]} dataKey="y" type="monotone" stroke="red" strokeDasharray="4 3" strokeWidth={1.5} dot={false} isAnimationActive={false} label={{ value: `LL=${llFit.ll}%`, fill: 'red', fontSize: 9, position: 'top' }} />
                  </>
                )}
                <Scatter data={llPoints} dataKey="y" fill="#BFCF99" stroke="#00233B" strokeWidth={1.5} r={5} name="Pontos" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export function LimitePlasticidadeSection({ data, lpTeors, lpMedia, onSetNested }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-foreground mb-1 text-center uppercase">Limite de Plasticidade</p>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-muted/8">
            <th className={thCls}>Campo</th>
            {(data.lp_rows || []).map((_, i) => <th key={`lp-col-${i}`} className={thCls + ' text-center'}>#{i+1}</th>)}
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Nº Cápsula', field: 'numero_capsula', type: 'text' },
            { label: 'Solo Úm.+Cáps. (M₁, g)', field: 'solo_umido_capsula', type: 'number' },
            { label: 'Solo Sec.+Cáps. (M₂, g)', field: 'solo_seco_capsula', type: 'number' },
            { label: 'Peso Cápsula (g)', field: 'peso_capsula', type: 'number' },
          ].map(row => (
            <tr key={row.field} className="bg-card/10">
              <td className={tdCls + ' font-medium text-foreground'}>{row.label}</td>
              {(data.lp_rows || []).map((r, i) => (
                <td key={i} className={tdCls}>
                  <Input className={fieldCls} type={row.type} step="0.001"
                    value={r[row.field] || ''}
                    onChange={e => onSetNested('lp_rows', i, row.field, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-muted/40 font-bold">
            <td className={tdCls + ' font-bold text-foreground'}>Teor de Umidade (%)</td>
            {(data.lp_rows || []).map((_, i) => <td key={`lp-calc-${i}`} className={tdCalcCls + ' font-bold text-primary'}>{lpTeors[i] != null ? lpTeors[i].toFixed(2) : '-'}</td>)}
          </tr>
        </tbody>
      </table>
      </div>
      {lpMedia != null && (
        <div className="mt-1 text-center text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-1">
          LP (média) = {lpMedia}%
        </div>
      )}
    </div>
  );
}