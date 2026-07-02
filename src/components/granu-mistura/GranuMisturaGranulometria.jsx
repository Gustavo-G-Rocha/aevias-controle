import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getPeneirasExibidas, getPeneirasKeys, getFaixaTrabalho, getEspecificacao } from "@/utils/granuMisturaUtils";

export default function GranuMisturaGranulometria({
  formData, selectedProject, faixaGran, faixaSelecionada,
  isApproved, handlePeneiraChange, handlePesoAmostraChange,
}) {
  const peneirasExibidas = getPeneirasExibidas(faixaGran, faixaSelecionada, formData.material);
  const showFaixaTrabalho = formData.material !== "OUTRO";
  const showEspecificacao = formData.material !== "OUTRO" || !!faixaSelecionada;
  const faixaAtiva = formData.material === "OUTRO" ? faixaSelecionada : faixaGran;

  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle className="text-base">2. Análise Granulométrica</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <Label className="text-xs font-bold">Peso da Amostra (g)</Label>
          <Input type="number" step="0.01" value={formData.peso_amostra} onChange={e => handlePesoAmostraChange(e.target.value)} disabled={isApproved} className="text-sm mt-1" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-[11px]">
            <thead className="bg-muted">
              <tr>
                <th className="border border-border px-2 py-1">ASTM</th>
                <th className="border border-border px-2 py-1">(mm)</th>
                <th className="border border-border px-2 py-1">RETIDO (g)</th>
                <th className="border border-border px-2 py-1">PASS. (g)</th>
                <th className="border border-border px-2 py-1">% PASS</th>
                {showFaixaTrabalho && (
                  <th className="border border-border px-2 py-1" colSpan="2">FAIXA DE TRABALHO</th>
                )}
                {showEspecificacao && (
                  <th className="border border-border px-2 py-1" colSpan="2">ESPECIFICAÇÃO</th>
                )}
              </tr>
              {(showFaixaTrabalho || showEspecificacao) && (
                <tr>
                  <th colSpan="5" className="border border-border bg-slate-50"></th>
                  {showFaixaTrabalho && (
                    <>
                      <th className="border border-border px-2 py-1">MÍN. (%)</th>
                      <th className="border border-border px-2 py-1">MÁX. (%)</th>
                    </>
                  )}
                  {showEspecificacao && (
                    <>
                      <th className="border border-border px-2 py-1">MÍN. (%)</th>
                      <th className="border border-border px-2 py-1">MÁX. (%)</th>
                    </>
                  )}
                </tr>
              )}
            </thead>
            <tbody>
              {peneirasExibidas.map((peneira) => {
                const idx = formData.peneiras.findIndex(p => p.abertura_mm === peneira.abertura_mm);
                if (idx === -1) return null;
                const peneiraData = formData.peneiras[idx];
                const { pKey, pKeyAlt } = getPeneirasKeys(peneira.abertura_mm);
                const ft  = getFaixaTrabalho(selectedProject, pKey, pKeyAlt);
                const esp = getEspecificacao(faixaAtiva, pKey, pKeyAlt);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border border-border px-2 py-1 text-center font-medium">{peneira.astm}</td>
                    <td className="border border-border px-2 py-1 text-center">{peneira.abertura_mm}</td>
                    <td className="border border-border px-1 py-1">
                      <Input type="number" step="0.01" value={peneiraData.retido_g}
                        onChange={e => handlePeneiraChange(idx, "retido_g", e.target.value)}
                        disabled={isApproved} className="h-6 text-[9px] text-center p-1" />
                    </td>
                    <td className="border border-border px-2 py-1 text-center bg-gray-50 text-[9px]">{peneiraData.passante_g || "-"}</td>
                    <td className="border border-border px-2 py-1 text-center bg-gray-50 font-bold text-[9px]">{peneiraData.passante_pct || "-"}</td>
                    {showFaixaTrabalho && (
                      <>
                        <td className="border border-border px-2 py-1 text-center text-blue-700 text-[9px]">{ft.min ?? "-"}</td>
                        <td className="border border-border px-2 py-1 text-center text-blue-700 text-[9px]">{ft.max ?? "-"}</td>
                      </>
                    )}
                    {showEspecificacao && (
                      <>
                        <td className="border border-border px-2 py-1 text-center text-green-700 text-[9px]">{esp.min ?? "-"}</td>
                        <td className="border border-border px-2 py-1 text-center text-green-700 text-[9px]">{esp.max ?? "-"}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}