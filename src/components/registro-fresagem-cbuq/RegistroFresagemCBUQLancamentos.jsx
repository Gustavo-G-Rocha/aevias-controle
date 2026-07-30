import React from "react";
import { useRegistroFresagemCBUQCtx } from "./RegistroFresagemCBUQContext";
import LancamentoCard from "./LancamentoCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function RegistroFresagemCBUQLancamentos() {
  const {
    formData, setFormData, canEdit,
    handleAddRegistro, handleRemoveRegistro, handleRegistroChange,
  } = useRegistroFresagemCBUQCtx();

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-foreground">FRESAGEM E RECOMPOSIÇÃO</h2>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={handleAddRegistro}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Lançamento
          </Button>
        )}
      </div>

      <div className="max-w-xs mb-4">
        <Label className="text-xs">Referência de Localização</Label>
        <Select
          value={formData.tipo_localizacao || "km"}
          onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_localizacao: value }))}
          disabled={!canEdit}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="km">Km</SelectItem>
            <SelectItem value="estaca">Estaca</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.registros.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">
          Nenhum lançamento adicionado. Clique em "Adicionar Lançamento" para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {formData.registros.map((linha, index) => (
            <LancamentoCard
              key={index}
              linha={linha}
              index={index}
              canEdit={canEdit}
              tipoLocalizacao={formData.tipo_localizacao}
              onChange={handleRegistroChange}
              onRemove={handleRemoveRegistro}
            />
          ))}
        </div>
      )}
    </div>
  );
}