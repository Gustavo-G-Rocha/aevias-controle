import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, User, Server } from "lucide-react";
import { compareFields } from "@/utils/conflictResolution";

function displayValue(value) {
  if (value === null || value === undefined) return "vazio";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      if (value.length === 0) return "lista vazia";
      if (value.every(v => typeof v !== "object" || v === null)) return value.join(", ");
      return `${value.length} ${value.length === 1 ? "item" : "itens"}`;
    }
    const keys = Object.keys(value);
    if (keys.length === 0) return "vazio";
    return keys.map(k => `${k}: ${typeof value[k] === "object" ? "…" : value[k]}`).join(", ");
  }
  return String(value);
}

/**
 * Diálogo de resolução de conflitos de sincronização.
 *
 * Mostra campos divergentes entre a versão local e a do servidor,
 * destacando campos sensíveis (dados numéricos de ensaio).
 *
 * O usuário pode:
 *  - "Manter versão do servidor" → descarta alterações locais
 *  - "Usar minha versão" → força sobrescrita (campos de aprovação são preservados)
 */
export const ConflictResolutionDialog = ({
  conflict,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [resolving, setResolving] = useState(false);

  if (!conflict) return null;

  const differences = compareFields(
    conflict.entityName,
    conflict.localData,
    conflict.serverData
  );

  const handleResolve = async (resolution) => {
    setResolving(true);
    try {
      await onResolve(conflict, resolution);
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!resolving) onClose(open); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Conflito de Sincronização
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium mb-1">
              {conflict.conflictReason || "Este registro foi modificado por outro usuário após o seu salvamento."}
            </p>
            <p className="text-xs text-amber-700">
              Registro: {conflict.entityName} • Seu salvamento:{" "}
              {conflict.clientUpdatedAt
                ? new Date(conflict.clientUpdatedAt).toLocaleString("pt-BR")
                : "—"}
            </p>
          </div>

          {differences.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 text-sm font-medium">
                Campos divergentes ({differences.length})
              </div>
              <div className="max-h-64 overflow-y-auto">
                {differences.map((diff) => (
                  <div
                    key={diff.field}
                    className="flex items-start gap-3 px-4 py-2 border-b last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{diff.field}</span>
                        {diff.sensitive && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            sensível
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs">
                        <div className="flex items-center gap-1 text-blue-600 min-w-0">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {displayValue(diff.localValue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 min-w-0">
                          <Server className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {displayValue(diff.serverValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não há diferenças nos dados — apenas os metadados de aprovação mudaram.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleResolve("discard")}
            disabled={resolving}
          >
            Manter versão do servidor
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleResolve("force")}
            disabled={resolving}
          >
            Usar minha versão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};