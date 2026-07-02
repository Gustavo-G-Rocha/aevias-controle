import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ObraDataSection({ obra, nc, form, updateForm }) {
  return (
    <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="text-foreground text-base bg-secondary/20/30 px-3 py-1 rounded">
          DADOS DA OBRA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground">Obra</Label>
            <Input
              value={obra?.name || nc.obra_nome || "—"}
              readOnly
              className="bg-card/30 border-white/20 text-foreground opacity-70"
            />
          </div>
          <div>
            <Label className="text-foreground">Cliente</Label>
            <Input
              value={form.cliente}
              onChange={(e) => updateForm("cliente", e.target.value)}
              className="bg-card/50 border-white/20 text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Rodovia</Label>
            <Input
              value={form.rodovia}
              onChange={(e) => updateForm("rodovia", e.target.value)}
              className="bg-card/50 border-white/20 text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Trecho</Label>
            <Input
              value={form.trecho}
              onChange={(e) => updateForm("trecho", e.target.value)}
              className="bg-card/50 border-white/20 text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Data da NC *</Label>
            <Input
              type="date"
              value={form.data_nc}
              onChange={(e) => updateForm("data_nc", e.target.value)}
              className="bg-card/50 border-white/20 text-foreground"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}