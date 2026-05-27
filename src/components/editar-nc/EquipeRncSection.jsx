import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EquipeRncSection({ nc, form, updateForm }) {
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#00233B] uppercase tracking-wider text-center border-b border-white/20 pb-1">
              Equipe Afirma Evias
            </p>
            <div>
              <Label className="text-[#00233B]">Campo</Label>
              <Input
                value={form.campo}
                onChange={(e) => updateForm("campo", e.target.value)}
                className="bg-white/50 border-white/20 text-[#00233B]"
              />
            </div>
            <div>
              <Label className="text-[#00233B]">Relatório (criador)</Label>
              <Input
                value={nc.relatorio_criador || "—"}
                readOnly
                className="bg-white/30 border-white/20 text-[#00233B] opacity-70"
              />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#00233B] uppercase tracking-wider text-center border-b border-white/20 pb-1">
              ID Executora
            </p>
            <div>
              <Label className="text-[#00233B]">Executora</Label>
              <Input
                value={form.executora}
                onChange={(e) => updateForm("executora", e.target.value)}
                className="bg-white/50 border-white/20 text-[#00233B]"
              />
            </div>
            <div>
              <Label className="text-[#00233B]">Contrato</Label>
              <Input
                value={form.contrato}
                onChange={(e) => updateForm("contrato", e.target.value)}
                className="bg-white/50 border-white/20 text-[#00233B]"
              />
            </div>
            <div>
              <Label className="text-[#00233B]">N° RNC</Label>
              <Input
                value={form.numero_rnc}
                onChange={(e) => updateForm("numero_rnc", e.target.value)}
                placeholder="Ex: RNC-001"
                className="bg-white/50 border-white/20 text-[#00233B]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}