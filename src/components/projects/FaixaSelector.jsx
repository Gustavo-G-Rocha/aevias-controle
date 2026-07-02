import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

/**
 * Componente reutilizável para seleção de faixa granulométrica
 * Usado em ProjectFormCAUQ, ProjectFormMRAF, ProjectFormGranular
 * 
 * Props:
 * - faixasFiltradas: Array de faixas disponíveis para o tipo de projeto
 * - selectedId: ID da faixa atualmente selecionada
 * - onChange: Callback ao selecionar uma faixa
 * - disabled: Se verdadeiro, desabilita o seletor
 */
export default function FaixaSelector({ 
  faixasFiltradas, 
  selectedId, 
  onChange, 
  disabled = false 
}) {
  const faixaSelecionada = faixasFiltradas?.find(f => f.id === selectedId);

  return (
    <div className="space-y-2">
      <Label htmlFor="faixa-selector" className="text-sm font-semibold">
        Faixa Granulométrica
      </Label>
      
      <Select value={selectedId || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="faixa-selector" className="w-full">
          <SelectValue placeholder="Selecione uma faixa..." />
        </SelectTrigger>
        <SelectContent>
          {faixasFiltradas && faixasFiltradas.length > 0 ? (
            faixasFiltradas.map((faixa) => (
              <SelectItem key={faixa.id} value={faixa.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{faixa.nome}</span>
                  {faixa.especificacao && (
                    <span className="text-xs text-muted-foreground">({faixa.especificacao})</span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Nenhuma faixa disponível
            </div>
          )}
        </SelectContent>
      </Select>

      {faixaSelecionada && (
        <div className="text-xs text-muted-foreground mt-1 flex items-start gap-2">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            {faixaSelecionada.peneiras?.length || 0} peneiras disponíveis para esta faixa
          </span>
        </div>
      )}
    </div>
  );
}