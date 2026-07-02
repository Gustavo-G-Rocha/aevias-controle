import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Cabeçalho da Certificação de Usina.
 * A Certificação usa apenas Obra + Data da Vistoria — diferente do Checklist de
 * Usina, ela NÃO possui projeto/usina/pedreira/ligante no schema, então esses
 * campos não são exibidos (antes apareciam vazios e confundiam o usuário).
 */
export default function CertificacaoUsinaHeader({
  formData,
  obras,
  regionais,
  regionalSelecionada,
  isEditable,
  isApproved,
  editingChecklist,
  onObraChange,
  onDataChange,
}) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-4"><CardTitle className="text-xl">Dados da Obra</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label className="text-base">Obra *</Label>
            <Select value={formData.obra_id || ""} onValueChange={onObraChange}
              disabled={!isEditable || isApproved || !!editingChecklist?.id}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {(obras || []).map(obra => {
                  const regional = (regionais || []).find(r => r.id === obra.regional_id);
                  return (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.name} - {obra.code} {regional && `(${regional.nome})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base">Data da Vistoria *</Label>
            <Input type="date" value={formData.data_vistoria || ""} onChange={(e) => onDataChange(e.target.value)}
              required disabled={!isEditable || isApproved} className="bg-background border-border text-foreground h-11 text-base" />
          </div>
        </div>

        {regionalSelecionada && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-1 text-sm">
            <p className="text-primary"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
            {regionalSelecionada.cliente && (
              <p className="text-primary"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}