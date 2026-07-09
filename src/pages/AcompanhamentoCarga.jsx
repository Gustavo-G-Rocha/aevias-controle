import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  AcompanhamentoCargaProvider,
  useAcompanhamentoCargaCtx,
} from "@/components/acompanhamento-carga/AcompanhamentoCargaContext";

import AcompanhamentoCargaHeader   from "@/components/acompanhamento-carga/AcompanhamentoCargaHeader";
import AcompanhamentoCargaDadosObra from "@/components/acompanhamento-carga/AcompanhamentoCargaDadosObra";
import AcompanhamentoCargaCargas   from "@/components/acompanhamento-carga/AcompanhamentoCargaCargas";
import AcompanhamentoCargaActions  from "@/components/acompanhamento-carga/AcompanhamentoCargaActions";

function AcompanhamentoCargaContent() {
  const { formData, setFormData, canEdit } = useAcompanhamentoCargaCtx();

  return (
    <div className="min-h-screen bg-transparent p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <AcompanhamentoCargaHeader />

        <Card className="bg-card border border-border text-card-foreground">
          <CardContent className="p-6 space-y-6">
            <AcompanhamentoCargaDadosObra />

            <AcompanhamentoCargaCargas />

            <div>
              <Label>Observações Gerais</Label>
              <Textarea
                value={formData.observacoes_gerais}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
                rows={3}
                disabled={!canEdit}
                className="text-xs mt-1"
              />
            </div>

            <AcompanhamentoCargaActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AcompanhamentoCarga() {
  return (
    <AcompanhamentoCargaProvider>
      <AcompanhamentoCargaContent />
    </AcompanhamentoCargaProvider>
  );
}