import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AcoesSection({ form, onFormChange }) {
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="text-[#00233B] text-base bg-[#BFCF99]/30 px-3 py-1 rounded">
          AÇÕES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label className="text-[#00233B] mb-2 block">Ações Recomendadas</Label>
        <Textarea
          value={form.acoes}
          onChange={e => onFormChange({ ...form, acoes: e.target.value })}
          rows={4}
          placeholder="Descreva as ações a serem tomadas..."
          className="bg-white/50 border-white/20 text-[#00233B]"
        />
      </CardContent>
    </Card>
  );
}