import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  RegistroFresagemCBUQProvider,
  useRegistroFresagemCBUQCtx,
} from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQContext";

import RegistroFresagemCBUQHeader from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQHeader";
import RegistroFresagemCBUQDadosObra from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQDadosObra";
import RegistroFresagemCBUQClima from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQClima";
import RegistroFresagemCBUQLancamentos from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQLancamentos";
import RegistroFresagemCBUQFotos from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQFotos";
import RegistroFresagemCBUQActions from "@/components/registro-fresagem-cbuq/RegistroFresagemCBUQActions";

function RegistroFresagemCBUQContent() {
  const { formData, setFormData, canEdit } = useRegistroFresagemCBUQCtx();

  return (
    <div className="min-h-screen bg-transparent p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <RegistroFresagemCBUQHeader />

        <Card className="bg-card border border-border text-card-foreground">
          <CardContent className="p-6 space-y-6">
            <RegistroFresagemCBUQDadosObra />

            <RegistroFresagemCBUQClima />

            <RegistroFresagemCBUQLancamentos />

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
                disabled={!canEdit}
                className="text-xs mt-1"
              />
            </div>

            <RegistroFresagemCBUQFotos />

            <RegistroFresagemCBUQActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegistroFresagemCBUQ() {
  return (
    <RegistroFresagemCBUQProvider>
      <RegistroFresagemCBUQContent />
    </RegistroFresagemCBUQProvider>
  );
}