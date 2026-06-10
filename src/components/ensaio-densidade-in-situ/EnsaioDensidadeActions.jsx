import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SaveProgressButton from "@/components/forms/SaveProgressButton";

export default function EnsaioDensidadeActions({ formData, setFormData, isEditable, saving, onSaveProgress }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          disabled={!isEditable}
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} className="hover:bg-black/10">
          Cancelar
        </Button>
        {isEditable && (
          <>
            <SaveProgressButton
              onClick={onSaveProgress}
              saving={saving}
              label="Salvar Progresso"
              savingLabel="Salvando..."
            />
            <Button type="submit" disabled={saving} className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
              ) : (
                <>Finalizar Ensaio</>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}