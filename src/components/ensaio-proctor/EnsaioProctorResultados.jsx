import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ProctorChart from "@/components/ensaios/ProctorChart";
import ProctorCBRExpansao from "@/components/ensaios/ProctorCBRExpansao";
import EnsaioLimites, { defaultLimites } from "@/components/ensaios/EnsaioLimites";

export default function EnsaioProctorResultados({
  form, setForm,
  chartPoints, parabola, densMaxAuto, umidOtimaAuto,
  updateUmidade, updateDensidade, updatePesoAmUmidaAll,
}) {
  const isHigro = form.correcao_densidade === "higroscopica";
  const umidadePoints = isHigro ? form.umidades.slice(0, 1) : form.umidades;

  return (
    <>
      {/* Umidades */}
      <Card className="bg-card border border-border">
        <CardHeader><CardTitle className="text-lg text-foreground">Umidade dos Pontos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <Label className="text-foreground">Tipo de Correção de Densidade</Label>
            <Select value={form.correcao_densidade} onValueChange={(v) => setForm(prev => ({ ...prev, correcao_densidade: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="higroscopica">Umidade Higroscópica</SelectItem>
                <SelectItem value="ponto_a_ponto">Umidade Ponto a Ponto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="border border-border/20 px-3 py-2 text-left font-medium text-foreground w-40">Campo</th>
                  {umidadePoints.map((_, idx) => (
                    <th key={idx} className="border border-border/20 px-3 py-2 text-center font-medium text-foreground">
                      {isHigro ? 'Umidade Higroscópica' : `Ponto ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-muted/10">
                  <td colSpan={umidadePoints.length + 1} className="border border-border/20 px-3 py-1 font-semibold text-foreground text-xs">Amostra 1</td>
                </tr>
                {[
                  { label: "Cáps. Nº", field: "capsula_numero_1", type: "text" },
                  { label: "Cap+Solo Úm. (g)", field: "capsula_solo_umido_1", type: "number" },
                  { label: "Cap+Solo Sec. (g)", field: "capsula_solo_seco_1", type: "number" },
                  { label: "Peso Cap (g)", field: "peso_capsula_1", type: "number" },
                ].map(({ label, field, type }) => (
                  <tr key={field} className="bg-card/10">
                    <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">{label}</td>
                    {umidadePoints.map((u, idx) => (
                      <td key={idx} className="border border-border/20 px-1 py-1">
                        <Input type={type} step="0.01" value={u[field] || ''} onChange={(e) => updateUmidade(idx, field, e.target.value)} className="h-8 text-xs" />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-muted/30">
                  <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">t (%)</td>
                  {umidadePoints.map((u, idx) => (
                    <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">{(u.teor_umidade_1 || 0).toFixed(2)}</td>
                  ))}
                </tr>
                {isHigro && (
                  <>
                    <tr className="bg-muted/10">
                      <td colSpan={umidadePoints.length + 1} className="border border-border/20 px-3 py-1 font-semibold text-foreground text-xs">Amostra 2</td>
                    </tr>
                    {[
                      { label: "Cáps. Nº", field: "capsula_numero_2", type: "text" },
                      { label: "Cap+Solo Úm. (g)", field: "capsula_solo_umido_2", type: "number" },
                      { label: "Cap+Solo Sec. (g)", field: "capsula_solo_seco_2", type: "number" },
                      { label: "Peso Cap (g)", field: "peso_capsula_2", type: "number" },
                    ].map(({ label, field, type }) => (
                      <tr key={field} className="bg-card/10">
                        <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">{label}</td>
                        {umidadePoints.map((u, idx) => (
                          <td key={idx} className="border border-border/20 px-1 py-1">
                            <Input type={type} step="0.01" value={u[field] || ''} onChange={(e) => updateUmidade(idx, field, e.target.value)} className="h-8 text-xs" />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-muted/30">
                      <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">t (%)</td>
                      {umidadePoints.map((u, idx) => (
                        <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">{(u.teor_umidade_2 || 0).toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr className="bg-muted/50">
                      <td className="border border-border/20 px-3 py-2 font-bold text-gray-400 text-xs">Média (%)</td>
                      {umidadePoints.map((u, idx) => (
                        <td key={idx} className="border border-border/20 px-2 py-2 text-center text-sm font-bold text-gray-500 bg-muted/50">{(u.teor_umidade_media || 0).toFixed(2)}</td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-secondary/20/20 border border-secondary/30/40 rounded-lg p-3 mt-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Umidade Média: </span>
              <span className="text-[#BFCF99] font-bold">{form.umidade_media != null ? Number(form.umidade_media).toFixed(2) : '-'}%</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Peso Amostra Úmida — apenas modo higroscópico */}
      {isHigro && (
        <Card className="bg-card border border-border">
          <CardHeader><CardTitle className="text-lg text-foreground">Peso Amostra Úmida por Ponto</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/10">
                    <th className="border border-border/20 px-3 py-2 text-left font-medium text-foreground w-40">Campo</th>
                    <th className="border border-border/20 px-3 py-2 text-center font-medium text-foreground">Massa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-card/20">
                    <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Peso Amostra Úmida (g)</td>
                    <td className="border border-border/20 px-1 py-1">
                      <Input type="number" step="0.01" value={form.densidades[0]?.peso_amostra_umida || ''} onChange={(e) => updatePesoAmUmidaAll(e.target.value)} className="h-8 text-xs" />
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">Peso Seco (g)</td>
                    <td className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">
                      {form.densidades[0]?.peso_seco > 0 ? Number(form.densidades[0].peso_seco).toFixed(2) : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Densidades */}
      <Card className="bg-card border border-border">
        <CardHeader><CardTitle className="text-lg text-foreground">Compactação - Densidade</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="border border-border/20 px-3 py-2 text-left font-medium text-foreground w-40">Campo</th>
                  {form.densidades.map((_, idx) => (
                    <th key={idx} className="border border-border/20 px-3 py-2 text-center font-medium text-foreground">Ponto {idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-card/20">
                  <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Cilindro Nº</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-1 py-1">
                      <Input value={d.cilindro_numero} onChange={(e) => setForm(prev => { const u = prev.densidades.map((x,i) => i===idx ? {...x, cilindro_numero: e.target.value} : x); return {...prev, densidades: u}; })} className="h-8 text-xs" />
                    </td>
                  ))}
                </tr>
                <tr className="bg-card/10">
                  <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Cilindro+Solo Úmido (g)</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-1 py-1">
                      <Input type="number" step="0.01" value={d.cilindro_solo_umido} onChange={(e) => updateDensidade(idx, 'cilindro_solo_umido', e.target.value)} className="h-8 text-xs" />
                    </td>
                  ))}
                </tr>
                <tr className="bg-card/20">
                  <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Peso Cilindro (g)</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-1 py-1">
                      <Input type="number" step="0.01" value={d.peso_cilindro} onChange={(e) => updateDensidade(idx, 'peso_cilindro', e.target.value)} className="h-8 text-xs" />
                    </td>
                  ))}
                </tr>
                <tr className="bg-card/10">
                  <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Vol Cilindro (cm³)</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-1 py-1">
                      <Input type="number" step="0.01" value={d.volume_cilindro} onChange={(e) => updateDensidade(idx, 'volume_cilindro', e.target.value)} className="h-8 text-xs" />
                    </td>
                  ))}
                </tr>
                {isHigro && (
                  <tr className="bg-card/20">
                    <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Peso Amostra Úmida (g)</td>
                    {form.densidades.map((d, idx) => (
                      <td key={idx} className="border border-border/20 px-1 py-1">
                        <Input type="number" step="0.01" value={d.peso_amostra_umida || ''} onChange={(e) => updateDensidade(idx, 'peso_amostra_umida', e.target.value)} className="h-8 text-xs" />
                      </td>
                    ))}
                  </tr>
                )}
                {isHigro && (
                  <tr className="bg-card/20">
                    <td className="border border-border/20 px-3 py-2 font-medium text-foreground text-xs">Água Adicionada (ml)</td>
                    {form.densidades.map((d, idx) => (
                      <td key={idx} className="border border-border/20 px-1 py-1">
                        <Input type="number" step="0.01" value={d.agua_adicionada_ml || ''} onChange={(e) => updateDensidade(idx, 'agua_adicionada_ml', e.target.value)} className="h-8 text-xs" />
                      </td>
                    ))}
                  </tr>
                )}
                <tr className="bg-muted/30">
                  <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">Peso Solo Úmido (g)</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">
                      {d.peso_solo_umido > 0 ? Number(d.peso_solo_umido).toFixed(2) : '-'}
                    </td>
                  ))}
                </tr>
                {isHigro && (
                  <tr className="bg-muted/30">
                    <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">Peso Seco (g)</td>
                    {form.densidades.map((d, idx) => (
                      <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">
                        {d.peso_seco > 0 ? Number(d.peso_seco).toFixed(2) : '-'}
                      </td>
                    ))}
                  </tr>
                )}
                {isHigro && (
                  <tr className="bg-muted/30">
                    <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">Umidade Calc. (%)</td>
                    {form.densidades.map((d, idx) => (
                      <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">
                        {d.umidade_calculada > 0 ? Number(d.umidade_calculada).toFixed(2) : '-'}
                      </td>
                    ))}
                  </tr>
                )}
                <tr className="bg-muted/30">
                  <td className="border border-border/20 px-3 py-2 font-semibold text-gray-400 text-xs">Dens. Ap. Úmida (g/cm³)</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/40">
                      {d.dens_ap_umida > 0 ? Number(d.dens_ap_umida).toFixed(3) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-muted/50">
                  <td className="border border-border/20 px-3 py-2 font-bold text-gray-400 text-xs">Dens. Ap. Seca (g/cm³)</td>
                  {form.densidades.map((d, idx) => (
                    <td key={idx} className="border border-border/20 px-2 py-2 text-center text-xs font-semibold text-gray-500 bg-muted/50">
                      {d.dens_ap_seca > 0 ? Number(d.dens_ap_seca).toFixed(3) : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Gráfico de Compactação (Prévia)</CardTitle>
          <div className="flex flex-wrap gap-4 mt-1 items-center">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${chartPoints.length >= 3 ? 'bg-secondary/20/40 text-foreground' : 'bg-red-100 text-destructive'}`}>
              {chartPoints.length} ponto{chartPoints.length !== 1 ? 's' : ''} válido{chartPoints.length !== 1 ? 's' : ''}
              {chartPoints.length < 3 && ` — mínimo 3 para calcular`}
            </span>
            {parabola && (
              <>
                <p className="text-sm text-foreground/80"><span className="font-semibold">γd máx: </span><span className="text-foreground font-bold">{parabola.gamma_max.toFixed(4)} g/cm³</span></p>
                <p className="text-sm text-foreground/80"><span className="font-semibold">w ótima: </span><span className="text-foreground font-bold">{parabola.w_otima.toFixed(2)}%</span></p>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ProctorChart points={chartPoints} parabola={parabola} />
          {chartPoints.length > 0 && chartPoints.length < 3 && (
            <p className="text-xs text-foreground/50 text-center mt-2">Preencha mais {3 - chartPoints.length} ponto(s) para gerar a curva de regressão</p>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card className="bg-card border border-border">
        <CardHeader><CardTitle className="text-lg text-foreground">Resultados</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">
                Densidade Máxima Seca (g/cm³)
                {densMaxAuto && <span className="ml-2 text-xs text-[#BFCF99] font-normal">(calculado: {densMaxAuto})</span>}
              </Label>
              <Input type="number" step="0.0001" value={form.densidade_maxima_seca || densMaxAuto} onChange={(e) => setForm(prev => ({ ...prev, densidade_maxima_seca: e.target.value }))} placeholder={densMaxAuto || "—"} />
            </div>
            <div>
              <Label className="text-foreground">
                Umidade Ótima (%)
                {umidOtimaAuto && <span className="ml-2 text-xs text-[#BFCF99] font-normal">(calculado: {umidOtimaAuto})</span>}
              </Label>
              <Input type="number" step="0.01" value={form.umidade_otima || umidOtimaAuto} onChange={(e) => setForm(prev => ({ ...prev, umidade_otima: e.target.value }))} placeholder={umidOtimaAuto || "—"} />
            </div>
            <div><Label className="text-foreground">ISC/CBR (%)</Label><Input type="number" step="0.01" value={form.isc_cbr} onChange={(e) => setForm(prev => ({ ...prev, isc_cbr: e.target.value }))} /></div>
            <div><Label className="text-foreground">Expansão (%)</Label><Input type="number" step="0.01" value={form.expansao} onChange={(e) => setForm(prev => ({ ...prev, expansao: e.target.value }))} /></div>
          </div>
          <div>
            <Label className="text-foreground">Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* CBR / Expansão — Opcional */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="realizar_cbr" checked={!!form.realizar_cbr_expansao} onChange={e => setForm(prev => ({ ...prev, realizar_cbr_expansao: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <label htmlFor="realizar_cbr" className="text-lg font-semibold text-foreground cursor-pointer select-none">
              Realizar Ensaio de ISC/CBR e Expansão <span className="text-sm font-normal text-foreground/60">(ABNT 9895 / DNIT 172)</span>
            </label>
          </div>
        </CardHeader>
        {form.realizar_cbr_expansao && (
          <CardContent className="pt-0">
            <ProctorCBRExpansao form={form} setForm={setForm} />
          </CardContent>
        )}
      </Card>

      {/* Limites — Opcional */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="realizar_limites" checked={!!form.realizar_limites} onChange={e => setForm(prev => ({ ...prev, realizar_limites: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <label htmlFor="realizar_limites" className="text-lg font-semibold text-foreground cursor-pointer select-none">
              Realizar Ensaios Físicos de Caracterização <span className="text-sm font-normal text-foreground/60">(ABNT NBR 7181/2025 | 6459/2017 | 7180/2016)</span>
            </label>
          </div>
        </CardHeader>
        {form.realizar_limites && (
          <CardContent className="pt-0">
            <EnsaioLimites data={form.limites || defaultLimites()} onChange={limites => setForm(prev => ({ ...prev, limites }))} />
          </CardContent>
        )}
      </Card>
    </>
  );
}