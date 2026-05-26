import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Send, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function AcompanhamentoUsinagemActions({
  isEditable, saving, approved, navigate, onSubmit,
}) {
  if (!isEditable) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 text-center">
            Este registro não pode mais ser editado.{' '}
            {approved ? 'Já foi aprovado.' : 'Entre em contato com o administrador.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={() => navigate(createPageUrl("MeusEnsaios"))} disabled={saving}>
        Cancelar
      </Button>
      <Button onClick={() => onSubmit(false)} disabled={saving}
        className="bg-gray-600 text-white hover:bg-gray-700">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar Rascunho
      </Button>
      <Button onClick={() => onSubmit(true)} disabled={saving}
        className="bg-[#566E3D] text-white hover:bg-[#566E3D]/90">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        Finalizar e Enviar
      </Button>
    </div>
  );
}