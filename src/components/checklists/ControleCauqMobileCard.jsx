import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ResultInput from "./ResultInput";

/**
 * Card mobile (<1024px) de um ensaio do Controle de CAUQ — substitui a
 * linha da tabela larga, seguindo o padrão do CamadaMobileCard.
 */
export default function ControleCauqMobileCard({
  ensaio, formData, onNestedChange, isEditable, isApproved, selectedProject,
}) {
  const entry = formData.controle_cauq[ensaio.key] ?? {};
  const quantidade = entry.quantidade || 0;
  const resultados = entry.resultados || [];
  const conforme = entry.conforme;
  const isAutoConformity = quantidade === 1 && ('conforme' in entry) && ensaio.key !== 'granulometria' && !ensaio.noConformity;
  const disabled = !isEditable || isApproved;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{ensaio.label}</span>
        {('realizado' in entry) && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={entry.realizado || false}
              onChange={(e) => onNestedChange(`controle_cauq.${ensaio.key}.realizado`, e.target.checked)}
              disabled={disabled}
              className="w-4 h-4"
            />
            Realizado
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {('quantidade' in entry) && (
          <div>
            <Label className="text-xs">Qtde</Label>
            <Input
              type="number"
              min="0"
              max="3"
              value={entry.quantidade || ''}
              onChange={(e) => onNestedChange(`controle_cauq.${ensaio.key}.quantidade`, e.target.value ? parseInt(e.target.value) : 0)}
              disabled={disabled}
              className="h-9 text-sm bg-background"
              placeholder="Qtde"
            />
          </div>
        )}
        <div>
          <Label className="text-xs">Padrão do Projeto</Label>
          <div className={`h-9 flex items-center px-3 rounded-md text-xs ${selectedProject ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'}`}>
            {ensaio.padrao}
          </div>
        </div>
      </div>

      {!ensaio.noResult && ('resultados' in entry) && quantidade > 0 && (
        <div>
          <Label className="text-xs">Resultado(s)</Label>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: quantidade }).map((_, resultIndex) => (
              <ResultInput
                key={`m-result-${ensaio.key}-${resultIndex}`}
                value={resultados[resultIndex]}
                onCommit={(v) => onNestedChange(`controle_cauq.${ensaio.key}.resultados.${resultIndex}`, v, ensaio.decimals)}
                disabled={disabled}
                style={{ width: quantidade > 1 ? '80px' : '100%' }}
                placeholder={quantidade > 1 ? `R${resultIndex + 1}` : 'Resultado'}
              />
            ))}
          </div>
        </div>
      )}

      {('conforme' in entry) && !ensaio.noConformity && (
        <div className="flex items-center gap-4 pt-1">
          <span className="text-xs text-muted-foreground">Conformidade:</span>
          <label className="flex items-center gap-1.5 text-xs select-none">
            <input
              type="checkbox"
              checked={conforme === true}
              onChange={(e) => onNestedChange(`controle_cauq.${ensaio.key}.conforme`, e.target.checked ? true : null)}
              disabled={disabled || isAutoConformity}
              className="w-4 h-4 accent-green-500"
              title={isAutoConformity ? "Conformidade automática" : ensaio.key === 'granulometria' ? "Sempre manual" : ""}
            />
            Conforme
          </label>
          <label className="flex items-center gap-1.5 text-xs select-none">
            <input
              type="checkbox"
              checked={conforme === false}
              onChange={(e) => onNestedChange(`controle_cauq.${ensaio.key}.conforme`, e.target.checked ? false : null)}
              disabled={disabled || isAutoConformity}
              className="w-4 h-4 accent-red-500"
              title={isAutoConformity ? "Conformidade automática" : ensaio.key === 'granulometria' ? "Sempre manual" : ""}
            />
            Não conforme
          </label>
        </div>
      )}
    </div>
  );
}