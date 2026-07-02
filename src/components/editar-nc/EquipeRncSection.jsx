import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EquipeRncSection({ nc, form, updateForm }) {
  return (
    <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-center border-b border-white/20 pb-1">
              Equipe Afirma Evias
            </p>
            <div>
              <Label className="text-foreground">Campo</Label>
              <Input
                value={form.campo}
                onChange={(e) => updateForm("campo", e.target.value)}
                className="bg-card/50 border-white/20 text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">Relatório (criador)</Label>
              <Input
                value={nc.relatorio_criador || "—"}
                readOnly
                className="bg-card/30 border-white/20 text-foreground opacity-70"
              />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-center border-b border-white/20 pb-1">
              ID Executora
            </p>
            <div>
              <Label className="text-foreground">Executora</Label>
              <Input
                value={form.executora}
                onChange={(e) => updateForm("executora", e.target.value)}
                className="bg-card/50 border-white/20 text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">Contrato</Label>
              <Input
                value={form.contrato}
                onChange={(e) => updateForm("contrato", e.target.value)}
                className="bg-card/50 border-white/20 text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">N° RNC</Label>
              <Input
                value={form.numero_rnc}
                onChange={(e) => updateForm("numero_rnc", e.target.value)}
                placeholder="Ex: RNC-001"
                className="bg-card/50 border-white/20 text-foreground"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}