import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DescricaoSection({ form, onFormChange }) {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle className="text-primary text-base bg-[#BFCF99]/30 px-3 py-1 rounded">
          DESCRIÇÃO DA NÃO CONFORMIDADE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label className="text-foreground mb-2 block">Descrição *</Label>
        <Textarea
          value={form.descricao_nc}
          onChange={e => onFormChange({ ...form, descricao_nc: e.target.value })}
          rows={6}
          placeholder="Descreva a não conformidade identificada..."
        />
      </CardContent>
    </Card>
  );
}