import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import CamadaMobileCard from "@/components/boletim-sondagem/CamadaMobileCard";

export default function BoletimSondagemTradoCamadas({ formData, setFormData, isEditable, handleCamadaChange, adicionarCamada, removerCamada }) {
  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-base">Sondagem — Camadas</CardTitle>
          {isEditable && (
            <Button
              type="button"
              onClick={adicionarCamada}
              size="sm"
              className=" text-xs"
              disabled={formData.camadas.length >= 15}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar Camada
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Label className="text-xs">Face da Sondagem</Label>
          <Input
            value={formData.face_classificacao_1 || ''}
            onChange={e => setFormData(p => ({ ...p, face_classificacao_1: e.target.value }))}
            disabled={!isEditable}
            placeholder="Ex.: Pista, Acostamento, etc."
            className="h-9 text-sm mt-1"
          />
        </div>
        {/* Mobile (<1024px): cards empilhados no padrão CamadaMobileCard */}
        <div className="lg:hidden space-y-3">
          {formData.camadas.map((camada, index) => (
            <CamadaMobileCard
              key={index}
              camada={camada}
              classificacaoField="classificacao_1"
              isEditable={isEditable}
              profDeEditable={index === 0}
              onFieldChange={(field, value) => handleCamadaChange(index, field, value)}
              onRemove={() => removerCamada(index)}
              canRemove={formData.camadas.length > 1}
            />
          ))}
        </div>
        {/* Desktop (≥1024px): tabela completa */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <colgroup>
              <col className="w-12" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[90px]" />
              <col className="w-[110px]" />
              <col />
              {isEditable && <col className="w-10" />}
            </colgroup>
            <thead>
              <tr className="bg-primary/10">
                <th className="border border-border px-2 py-2 text-center font-medium">Nº</th>
                <th className="border border-border px-2 py-2 text-center font-medium" colSpan={2}>PROF. (m)</th>
                <th className="border border-border px-2 py-2 text-center font-medium">ESP. (m)</th>
                <th className="border border-border px-2 py-2 text-center font-medium">N.A (m)</th>
                <th className="border border-border px-2 py-2 text-center font-medium">CLASSIFICAÇÃO</th>
                {isEditable && <th className="border border-border px-2 py-2"></th>}
              </tr>
              <tr className="bg-muted/30">
                <th className="border border-border px-2 py-1"></th>
                <th className="border border-border px-2 py-1 text-center text-xs font-medium">DE</th>
                <th className="border border-border px-2 py-1 text-center text-xs font-medium">ATÉ</th>
                <th className="border border-border px-2 py-1"></th>
                <th className="border border-border px-2 py-1"></th>
                <th className="border border-border px-2 py-1"></th>
                {isEditable && <th className="border border-border px-2 py-1"></th>}
              </tr>
            </thead>
            <tbody>
              {formData.camadas.map((camada, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : 'bg-muted/10'}>
                  <td className="border border-border px-2 py-1 text-center font-medium text-muted-foreground">{camada.numero}</td>
                  {index === 0 ? (
                    <td className="border border-border px-1 py-1">
                      <Input type="number" step="0.01" value={camada.prof_de ?? ''} onChange={e => handleCamadaChange(0, 'prof_de', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-background" placeholder="0,00" />
                    </td>
                  ) : (
                    <td className="border border-border px-1 py-1 bg-muted/40 text-center text-xs font-medium text-muted-foreground">
                      {camada.prof_de !== null && camada.prof_de !== undefined ? camada.prof_de.toFixed(2) : '—'}
                    </td>
                  )}
                  <td className="border border-border px-1 py-1">
                    <Input type="number" step="0.01" value={camada.prof_ate ?? ''} onChange={e => handleCamadaChange(index, 'prof_ate', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-background" placeholder="0,00" />
                  </td>
                  <td className="border border-border px-1 py-1 bg-muted/40 text-center text-xs font-medium text-muted-foreground">
                    {camada.espessura !== null && camada.espessura !== undefined ? camada.espessura.toFixed(2) : ''}
                  </td>
                  <td className="border border-border px-1 py-1">
                    <Input type="number" step="0.01" value={camada.na ?? ''} onChange={e => handleCamadaChange(index, 'na', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-background" />
                  </td>
                  <td className="border border-border px-1 py-1">
                    <Input value={camada.classificacao_1} onChange={e => handleCamadaChange(index, 'classificacao_1', e.target.value)} disabled={!isEditable} className="h-8 text-xs bg-background" placeholder="Escrever" />
                  </td>
                  {isEditable && (
                    <td className="border border-border px-1 py-1 text-center">
                      {formData.camadas.length > 1 && (
                        <button type="button" onClick={() => removerCamada(index)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}