import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const AMOSTRA_1_FIELDS = [
  { label: "Cáps. Nº", field: "capsula_numero_1", type: "text" },
  { label: "Cap+Solo Úm. (g)", field: "capsula_solo_umido_1", type: "number" },
  { label: "Cap+Solo Sec. (g)", field: "capsula_solo_seco_1", type: "number" },
  { label: "Peso Cap (g)", field: "peso_capsula_1", type: "number" },
];

const AMOSTRA_2_FIELDS = [
  { label: "Cáps. Nº", field: "capsula_numero_2", type: "text" },
  { label: "Cap+Solo Úm. (g)", field: "capsula_solo_umido_2", type: "number" },
  { label: "Cap+Solo Sec. (g)", field: "capsula_solo_seco_2", type: "number" },
  { label: "Peso Cap (g)", field: "peso_capsula_2", type: "number" },
];

export default function ProctorUmidadeCard({ form, setForm, umidadePoints, updateUmidade }) {
  const isHigro = form.correcao_densidade === "higroscopica";

  return (
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
              {AMOSTRA_1_FIELDS.map(({ label, field, type }) => (
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
                  {AMOSTRA_2_FIELDS.map(({ label, field, type }) => (
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
            <span className="text-secondary font-bold">{form.umidade_media != null ? Number(form.umidade_media).toFixed(2) : '-'}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}