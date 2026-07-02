import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function EquipeSection({ form, onFormChange, user }) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-center border-b border-border pb-1">
              Equipe Afirma Evias
            </p>
            <div>
              <Label className="text-foreground">Campo</Label>
              <Input
                value={form.campo}
                onChange={e => onFormChange({ ...form, campo: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground">Relatório (criador)</Label>
              <Input
                value={form.relatorio_criador || user?.laboratorista_name || user?.full_name || ""}
                readOnly
                className="opacity-70"
              />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-center border-b border-border pb-1">
              ID Executora
            </p>
            <div>
              <Label className="text-foreground">Executora</Label>
              <Input
                value={form.executora}
                onChange={e => onFormChange({ ...form, executora: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground">Contrato</Label>
              <Input
                value={form.contrato}
                onChange={e => onFormChange({ ...form, contrato: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground">N° RNC</Label>
              <Input
                value={form.numero_rnc}
                onChange={e => onFormChange({ ...form, numero_rnc: e.target.value })}
                placeholder="Ex: RNC-001"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}