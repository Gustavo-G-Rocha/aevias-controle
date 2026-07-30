import React from "react";
import { useRegistroFresagemCBUQCtx } from "./RegistroFresagemCBUQContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PERIODOS = [
  { key: "manha", label: "Manhã" },
  { key: "tarde", label: "Tarde" },
  { key: "noite", label: "Noite" },
];

export default function RegistroFresagemCBUQClima() {
  const { formData, setFormData, canEdit } = useRegistroFresagemCBUQCtx();

  const setPeriodo = (key, value) => {
    setFormData(prev => ({
      ...prev,
      condicoes_tempo: { ...(prev.condicoes_tempo || {}), [key]: value },
    }));
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4 border-b pb-2">CONDIÇÕES DO TEMPO</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PERIODOS.map(({ key, label }) => (
          <div key={key}>
            <Label className="text-xs">{label}</Label>
            <Select
              value={formData.condicoes_tempo?.[key] || ""}
              onValueChange={(value) => setPeriodo(key, value)}
              disabled={!canEdit}
            >
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bom">Bom</SelectItem>
                <SelectItem value="chuva">Chuva</SelectItem>
                <SelectItem value="instavel">Instável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}