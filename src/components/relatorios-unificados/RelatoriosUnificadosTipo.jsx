import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { typeOptions } from "@/components/ensaios/ensaioMappers";

export default function RelatoriosUnificadosTipo({
  tipoRegistro,
  setTipoRegistro,
}) {
  return (
    <div className="space-y-2">
      <Label>Tipo de Registro *</Label>
      <Select value={tipoRegistro} onValueChange={setTipoRegistro}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          {typeOptions
            .filter((o) => o.value !== "all")
            .map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}