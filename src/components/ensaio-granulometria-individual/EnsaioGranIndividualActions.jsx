import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function EnsaioGranIndividualActions({
  isEditable, isApproved, onSubmit, navigate,
}) {
  return (
    <>
      {/* Espaço para a barra de ações fixa não sobrepor o conteúdo */}
      <div className="h-28 lg:h-20" aria-hidden="true" />

      {/* Barra fixa no rodapé para permanecer visível durante o preenchimento */}
      <div className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-4xl z-30 flex justify-end gap-4 rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))}>
          Cancelar
        </Button>

        {isEditable && !isApproved && (
          <>
            <Button type="button" variant="outline"
              onClick={(e) => onSubmit(e, 'rascunho')}
            >
              <Save className="mr-2 h-4 w-4" /> Salvar Progresso
            </Button>
            <Button type="button" onClick={(e) => onSubmit(e, 'finalizado')}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Registro
            </Button>
          </>
        )}

        {isApproved && (
          <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
            <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
          </Badge>
        )}
      </div>
    </>
  );
}