import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const EMPTY_MEDICAO = {
  estaca_inicial: "", estaca_final: "", lado: "", faixa: "",
  comprimento: null, largura: null, altura: null,
  placa: "", quantidade: null, temperatura: null, observacoes: "",
};

export default function MedicoesGeometricasSection({ medicoes_geometricas, onChange, disabled }) {
  const medicoes = medicoes_geometricas?.medicoes || [];

  const updateField = useCallback((field, value) => {
    onChange({ ...medicoes_geometricas, [field]: value });
  }, [medicoes_geometricas, onChange]);

  const updateMedicao = useCallback((index, field, value) => {
    const updated = [...medicoes];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...medicoes_geometricas, medicoes: updated });
  }, [medicoes, medicoes_geometricas, onChange]);

  const addMedicao = useCallback(() => {
    onChange({ ...medicoes_geometricas, medicoes: [...medicoes, { ...EMPTY_MEDICAO }] });
  }, [medicoes, medicoes_geometricas, onChange]);

  const removeMedicao = useCallback((index) => {
    const updated = medicoes.filter((_, i) => i !== index);
    onChange({ ...medicoes_geometricas, medicoes: updated });
  }, [medicoes, medicoes_geometricas, onChange]);

  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-[#00233B] mb-4">Medição Geométrica de Campo</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Subtrecho</Label>
          <Input
            value={medicoes_geometricas?.subtrecho || ""}
            onChange={(e) => updateField("subtrecho", e.target.value)}
            disabled={disabled}
            placeholder="Ex: km 100 ao km 105"
          />
        </div>
        <div>
          <Label>Serviço</Label>
          <Input
            value={medicoes_geometricas?.servico || ""}
            onChange={(e) => updateField("servico", e.target.value)}
            disabled={disabled}
            placeholder="Ex: Pavimentação asfáltica"
          />
        </div>
      </div>

      {!disabled && (
        <Button type="button" variant="outline" onClick={addMedicao} className="w-full mb-4">
          + Adicionar Medição
        </Button>
      )}

      {medicoes.length > 0 && (
        <div className="space-y-4">
          {medicoes.map((medicao, index) => (
            <Card key={`medicao-${index}`} className="border-2 border-[#BFCF99]/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Medição #{index + 1}</CardTitle>
                  {!disabled && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMedicao(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: "estaca_inicial", label: "Estaca Inicial", placeholder: "Ex: 100+5" },
                    { key: "estaca_final", label: "Estaca Final", placeholder: "Ex: 105+0" },
                    { key: "faixa", label: "Faixa", placeholder: "Ex: A, B, C" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <Label className="text-xs">{label}</Label>
                      <Input value={medicao[key] || ""} onChange={(e) => updateMedicao(index, key, e.target.value)} disabled={disabled} placeholder={placeholder} className="h-9 text-sm" />
                    </div>
                  ))}
                  <div>
                    <Label className="text-xs">Lado</Label>
                    <Select value={medicao.lado || ""} onValueChange={(v) => updateMedicao(index, "lado", v)} disabled={disabled}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direito">Direito</SelectItem>
                        <SelectItem value="esquerdo">Esquerdo</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "comprimento", label: "Comprimento (m)", step: "0.01" },
                    { key: "largura", label: "Largura (m)", step: "0.01" },
                    { key: "altura", label: "Altura (m)", step: "0.01" },
                    { key: "quantidade", label: "Quantidade", step: "0.01" },
                    { key: "temperatura", label: "Temperatura (°C)", step: "0.1" },
                  ].map(({ key, label, step }) => (
                    <div key={key}>
                      <Label className="text-xs">{label}</Label>
                      <Input type="number" step={step} value={medicao[key] ?? ""} onChange={(e) => updateMedicao(index, key, e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} placeholder="0.00" className="h-9 text-sm" />
                    </div>
                  ))}
                  <div>
                    <Label className="text-xs">Placa</Label>
                    <Input value={medicao.placa || ""} onChange={(e) => updateMedicao(index, "placa", e.target.value)} disabled={disabled} placeholder="Ex: ABC-1234" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Observações</Label>
                  <Textarea value={medicao.observacoes || ""} onChange={(e) => updateMedicao(index, "observacoes", e.target.value)} disabled={disabled} placeholder="Observações sobre esta medição..." rows={2} className="text-sm" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}