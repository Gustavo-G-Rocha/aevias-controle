import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  ControleExecucaoServicosProvider,
  useControleExecucaoServicosCtx,
} from "@/components/controle-execucao-servicos/ControleExecucaoServicosContext";

import ControleExecucaoServicosHeader from "@/components/controle-execucao-servicos/ControleExecucaoServicosHeader";
import ControleExecucaoServicosDadosObra from "@/components/controle-execucao-servicos/ControleExecucaoServicosDadosObra";
import ControleExecucaoServicosServicos from "@/components/controle-execucao-servicos/ControleExecucaoServicosServicos";
import ControleExecucaoServicosActions from "@/components/controle-execucao-servicos/ControleExecucaoServicosActions";
import ControleExecucaoServicosFotos from "@/components/controle-execucao-servicos/ControleExecucaoServicosFotos";

function ControleExecucaoServicosContent() {
  const { formData, setFormData, canEdit } = useControleExecucaoServicosCtx();

  return (
    <div className="min-h-screen bg-transparent p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <ControleExecucaoServicosHeader />

        <Card className="bg-card border border-border text-card-foreground">
          <CardContent className="p-6 space-y-6">
            <ControleExecucaoServicosDadosObra />

            <ControleExecucaoServicosServicos />

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

            <ControleExecucaoServicosFotos />

            <ControleExecucaoServicosActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ControleExecucaoServicos() {
  return (
    <ControleExecucaoServicosProvider>
      <ControleExecucaoServicosContent />
    </ControleExecucaoServicosProvider>
  );
}