import React from "react";
import { useControleExecucaoServicosCtx } from "./ControleExecucaoServicosContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

const numOrNull = (v) => (v === "" ? null : parseFloat(v));

function ServicoCard({ servico, index, canEdit, onChange, onRemove }) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm text-foreground">Serviço {index + 1}</p>
        {canEdit && (
          <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => onRemove(index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div>
        <Label className="text-xs">Serviço *</Label>
        <Input
          value={servico.servico || ""}
          onChange={(e) => onChange(index, "servico", e.target.value)}
          disabled={!canEdit}
          placeholder="Descrição do serviço realizado"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Estaca Inicial</Label>
          <Input
            value={servico.estaca_inicial || ""}
            onChange={(e) => onChange(index, "estaca_inicial", e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">Estaca Final</Label>
          <Input
            value={servico.estaca_final || ""}
            onChange={(e) => onChange(index, "estaca_final", e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">Comprimento (m)</Label>
          <Input
            type="number"
            value={servico.comprimento_m ?? ""}
            onChange={(e) => onChange(index, "comprimento_m", numOrNull(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">Espessura (cm)</Label>
          <Input
            type="number"
            value={servico.espessura_cm ?? ""}
            onChange={(e) => onChange(index, "espessura_cm", numOrNull(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">Largura (m)</Label>
          <Input
            type="number"
            value={servico.largura_m ?? ""}
            onChange={(e) => onChange(index, "largura_m", numOrNull(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">Quantidade</Label>
          <Input
            type="number"
            value={servico.quantidade ?? ""}
            onChange={(e) => onChange(index, "quantidade", numOrNull(e.target.value))}
            disabled={!canEdit}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Executora</Label>
        <Input
          value={servico.executora || ""}
          onChange={(e) => onChange(index, "executora", e.target.value)}
          disabled={!canEdit}
          placeholder="Empresa executora"
        />
      </div>
    </div>
  );
}

export default function ControleExecucaoServicosServicos() {
  const {
    formData, canEdit,
    handleAddServico, handleRemoveServico, handleServicoChange,
  } = useControleExecucaoServicosCtx();

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-foreground">SERVIÇOS REALIZADOS</h2>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={handleAddServico}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Serviço
          </Button>
        )}
      </div>

      {formData.servicos.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">
          Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {formData.servicos.map((servico, index) => (
            <ServicoCard
              key={index}
              servico={servico}
              index={index}
              canEdit={canEdit}
              onChange={handleServicoChange}
              onRemove={handleRemoveServico}
            />
          ))}
        </div>
      )}
    </div>
  );
}