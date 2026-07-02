import { Save, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Barra de ações padronizada para formulários de checklist/ensaio.
 * Renderiza Cancelar / Salvar Progresso / Finalizar com estado correto.
 *
 * Props:
 *   isEditable      — boolean
 *   isApproved      — boolean — exibe badge "Aprovado" em vez dos botões
 *   loading         — boolean — desativa botões durante operação
 *   saving          — boolean — exibe spinner no botão Finalizar
 *   onCancel        — () => void
 *   onSaveProgress  — (e) => void
 *   onFinalize      — (e) => void — se omitido, usa type="submit"
 *   finalizeLabel   — string — texto do botão (default: "Finalizar")
 *   savingLabel     — string — texto durante save (default: "Salvando...")
 */
export default function FormActions({
  isEditable = true,
  isApproved = false,
  loading = false,
  saving = false,
  onCancel,
  onSaveProgress,
  onFinalize,
  finalizeLabel = "Finalizar",
  savingLabel = "Salvando...",
}) {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading || saving}>
        Cancelar
      </Button>

      {isEditable && !isApproved && (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={loading || saving}
            onClick={onSaveProgress}

          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Progresso
          </Button>

          <Button
            type={onFinalize ? "button" : "submit"}
            disabled={loading || saving}
            onClick={onFinalize}

          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {savingLabel}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {finalizeLabel}
              </>
            )}
          </Button>
        </>
      )}

      {isApproved && (
        <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
          <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
        </Badge>
      )}
    </div>
  );
}