import React from "react";
import { useControleExecucaoServicosCtx } from "./ControleExecucaoServicosContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ControleExecucaoServicosDadosObra() {
  const {
    formData, setFormData,
    obras, obraSelecionada, regionalSelecionada,
    canEdit,
    handleObraChange,
  } = useControleExecucaoServicosCtx();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4 border-b pb-2">DADOS DA OBRA</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Obra *</Label>
          <Select
            value={formData.obra_id}
            onValueChange={handleObraChange}
            disabled={!canEdit}
          >
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map((obra) => (
                <SelectItem key={obra.id} value={obra.id}>
                  {obra.name} ({obra.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Cliente (Automático)</Label>
          <Input value={regionalSelecionada?.cliente || ""} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Rodovia *</Label>
          <Select
            value={formData.rodovia}
            onValueChange={(value) => setFormData(prev => ({ ...prev, rodovia: value }))}
            disabled={!canEdit || !formData.obra_id}
          >
            <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
            <SelectContent>
              {obraSelecionada?.rodovias?.map((rodovia) => (
                <SelectItem key={rodovia} value={rodovia}>{rodovia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Trecho *</Label>
          <Input
            value={formData.trecho}
            onChange={(e) => setFormData(prev => ({ ...prev, trecho: e.target.value }))}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Inspetor (Automático)</Label>
          <Input value={formData.laboratorista_name} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Data *</Label>
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
            disabled={!canEdit}
          />
        </div>
      </div>
    </div>
  );
}