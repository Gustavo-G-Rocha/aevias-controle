import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { getDensidadeInicial } from "@/utils/boletimSondagemTradoUtils";
import { calcularUmidadeMedia } from "@/utils/boletimSondagemTradoUtils";

// ── Tabela de umidade (reutilizada para UN1 e UN2) ─────────────────────────────
function TabelaUmidade({ un, isEditable, onFieldChange }) {
  const inputRows = [
    { label: "Nº cápsula", fields: ['no_capsula_1', 'no_capsula_2'], type: 'text' },
    { label: "Massa cápsula (g)", fields: ['massa_capsula_1', 'massa_capsula_2'], type: 'number' },
    { label: "Massa cap + solo úmido (g)", fields: ['massa_cap_solo_umido_1', 'massa_cap_solo_umido_2'], type: 'number' },
    { label: "Massa cap + solo seco (g)", fields: ['massa_cap_solo_seco_1', 'massa_cap_solo_seco_2'], type: 'number' },
  ];
  const calcRows = [
    { label: "Massa da água (g)", keys: ['massa_agua_1', 'massa_agua_2'] },
    { label: "Massa do solo seco (g)", keys: ['massa_solo_seco_1', 'massa_solo_seco_2'] },
  ];
  const umidadeMedia = calcularUmidadeMedia(un?.umidade_1, un?.umidade_2);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-primary/10">
            <th className="border border-border px-3 py-2 text-left font-medium text-foreground">Campo</th>
            <th className="border border-border px-3 py-2 text-center font-medium text-foreground">Amostra 1</th>
            <th className="border border-border px-3 py-2 text-center font-medium text-foreground">Amostra 2</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-muted/20">
            <td className="border border-border px-3 py-1.5 font-medium text-muted-foreground">Camada ensaiada</td>
            <td className="border border-border px-2 py-1" colSpan={2}>
              <Input value={un?.camada_ensaiada_1 || ''} onChange={e => onFieldChange('camada_ensaiada_1', e.target.value)} disabled={!isEditable} className="h-8 text-sm" placeholder="Ex.: 0,00 - 0,60m" />
            </td>
          </tr>
          {inputRows.map(({ label, fields, type }, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-muted/10' : 'bg-muted/20'}>
              <td className="border border-border px-3 py-1.5 font-medium text-muted-foreground">{label}</td>
              {fields.map((f, fi) => (
                <td key={fi} className="border border-border px-2 py-1">
                  {type === 'text'
                    ? <Input value={un?.[f] || ''} onChange={e => onFieldChange(f, e.target.value)} disabled={!isEditable} className="h-8 text-sm" />
                    : <Input type="number" step="0.01" value={un?.[f] ?? ''} onChange={e => onFieldChange(f, e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-sm" />
                  }
                </td>
              ))}
            </tr>
          ))}
          {calcRows.map(({ label, keys }, ri) => (
            <tr key={`calc-${ri}`} className="bg-secondary/10">
              <td className="border border-border px-3 py-1.5 font-medium text-muted-foreground italic">{label}</td>
              {keys.map((k, ki) => (
                <td key={ki} className="border border-border px-3 py-1.5 text-center font-semibold text-foreground">
                  {un?.[k] !== null && un?.[k] !== undefined ? un[k].toFixed(2) : '—'}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-secondary/20">
            <td className="border border-border px-3 py-2 font-bold text-foreground">Umidade (%)</td>
            <td className="border border-border px-3 py-2 text-center font-bold text-foreground text-base" colSpan={2}>
              {umidadeMedia !== null ? `${umidadeMedia.toFixed(2)} %` : '—'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Tabela de densidade in situ ────────────────────────────────────────────────
function TabelaDensidade({ densidades, isEditable, handleDensidadeChange, removerDensidade }) {
  const nEnsaios = densidades.length;
  const numInput = (val, onChange, step = "0.01") => (
    <Input type="number" step={step} value={val ?? ''} onChange={(e) => onChange(e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-muted/100 min-w-[90px]" />
  );
  const calc = (val, dec = 2) => val !== null && val !== undefined ? val.toFixed(dec) : '—';

  const rows = [
    { label: "Camada ensaiada em campo", field: "camada_ensaiada", type: "text" },
    { label: "— VOLUME —", section: true },
    { label: "Peso do frasco antes (gf)", field: "peso_frasco_antes", type: "number", step: "0.001" },
    { label: "Peso do frasco depois (gf)", field: "peso_frasco_depois", type: "number", step: "0.001" },
    { label: "Peso da areia no funil e placa (gf)", field: "peso_areia_funil_placa", type: "number", step: "0.001" },
    { label: "Massa esp. aparente da areia (g/dm³)", field: "massa_esp_aparente_areia", type: "number", step: "0.001" },
    { label: "Peso da areia deslocada (gf)", field: "peso_areia_deslocada", type: "calc", dec: 2 },
    { label: "Peso da areia na cavidade (gf)", field: "peso_areia_cavidade", type: "calc", dec: 2 },
    { label: "Volume do buraco (dm³)", field: "volume_buraco", type: "calc", dec: 3 },
    { label: "— MASSA —", section: true },
    { label: "Peso do solo e recipiente (gf)", field: "peso_solo_recipiente", type: "number" },
    { label: "Peso do recipiente (gf)", field: "peso_recipiente", type: "number" },
    { label: "Peso do solo (gf)", field: "peso_solo", type: "calc", dec: 2 },
    { label: "— UMIDADE —", section: true },
    { label: "Peso do solo úmido (gf)", field: "peso_solo_umido", type: "number" },
    { label: "Peso do solo seco (gf)", field: "peso_solo_seco", type: "number" },
    { label: "Teor de umidade (%)", field: "teor_umidade", type: "calc", dec: 2 },
    { label: "— RESULTADOS —", section: true },
    { label: "Dens. Aparente Solo Úmido (g/dm³)", field: "densidade_aparente_solo_umido", type: "result", dec: 3 },
    { label: "Dens. Aparente Solo Seco (g/dm³)", field: "densidade_aparente_solo_seco", type: "result", dec: 3 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-primary/10">
            <th className="border border-border px-3 py-2 text-left font-medium text-foreground min-w-[220px]">Campo</th>
            {densidades.map((_, i) => (
              <th key={i} className="border border-border px-3 py-2 text-center font-medium text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Ensaio {i + 1}</span>
                  {isEditable && nEnsaios > 1 && (
                    <button type="button" onClick={() => removerDensidade(i)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            if (row.section) {
              return (
                <tr key={ri} className="bg-primary/10">
                  <td colSpan={nEnsaios + 1} className="border border-border px-3 py-1 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
                    {row.label.replace(/—/g, '').trim()}
                  </td>
                </tr>
              );
            }
            const isCalc = row.type === 'calc' || row.type === 'result';
            const isResult = row.type === 'result';
            return (
              <tr key={ri} className={isResult ? 'bg-secondary/20' : isCalc ? 'bg-secondary/10' : (ri % 2 === 0 ? 'bg-muted/20' : 'bg-muted/10')}>
                <td className={`border border-border px-3 py-1.5 font-medium text-muted-foreground text-xs ${isCalc ? 'italic' : ''} ${isResult ? 'font-bold text-foreground' : ''}`}>{row.label}</td>
                {densidades.map((d, di) => (
                  <td key={di} className={`border border-border px-2 py-1 text-center ${isCalc ? 'font-semibold text-foreground' : ''}`}>
                    {isCalc ? (
                      <span className={isResult ? 'text-base font-bold text-foreground' : ''}>{calc(d[row.field], row.dec ?? 2)}</span>
                    ) : row.type === 'text' ? (
                      <Input value={d[row.field] || ''} onChange={e => handleDensidadeChange(di, row.field, e.target.value)} disabled={!isEditable} className="h-8 text-xs bg-muted/100 min-w-[90px]" />
                    ) : (
                      numInput(d[row.field], v => handleDensidadeChange(di, row.field, v), row.step || "0.01")
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Export principal ───────────────────────────────────────────────────────────
export default function BoletimSondagemTradoResultados({
  formData, setFormData, isEditable,
  handleUmidadeChange, adicionarUmidade2, removerUmidade2, handleUmidade2Change,
  handleDensidadeChange, adicionarDensidade, removerDensidade,
}) {
  return (
    <>
      {/* Umidade Natural 1 */}
      <Card className="bg-muted/30 border-border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Umidade Natural 1 — DNER-ME 213/94</CardTitle>
            {isEditable && !formData.umidade_natural_2 && (
              <Button type="button" size="sm" variant="outline" className=" text-xs" onClick={adicionarUmidade2}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar 2ª Umidade
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TabelaUmidade un={formData.umidade_natural} isEditable={isEditable} onFieldChange={handleUmidadeChange} />
        </CardContent>
      </Card>

      {/* Umidade Natural 2 */}
      {formData.umidade_natural_2 && (
        <Card className="bg-muted/30 border-border">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Umidade Natural 2 — DNER-ME 213/94</CardTitle>
              {isEditable && (
                <Button type="button" size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs" onClick={removerUmidade2}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <TabelaUmidade un={formData.umidade_natural_2} isEditable={isEditable} onFieldChange={handleUmidade2Change} />
          </CardContent>
        </Card>
      )}

      {/* Densidade In Situ */}
      <Card className="bg-muted/30 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Massa Específica Aparente In Situ — DNER-ME 092/94</CardTitle>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ensaio_insitu_realizado}
                  onChange={e => setFormData(prev => ({ ...prev, ensaio_insitu_realizado: e.target.checked }))}
                  disabled={!isEditable}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-foreground">Ensaio realizado</span>
              </label>
              {isEditable && formData.ensaio_insitu_realizado && (formData.densidades_in_situ || []).length < 3 && (
                <Button type="button" onClick={adicionarDensidade} size="sm" className=" text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Ensaio
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {formData.ensaio_insitu_realizado ? (
          <CardContent>
            <TabelaDensidade
              densidades={formData.densidades_in_situ || [getDensidadeInicial()]}
              isEditable={isEditable}
              handleDensidadeChange={handleDensidadeChange}
              removerDensidade={removerDensidade}
            />
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-sm text-muted-foreground/70 italic text-center py-4">Ensaio in situ não realizado neste boletim.</p>
          </CardContent>
        )}
      </Card>
    </>
  );
}