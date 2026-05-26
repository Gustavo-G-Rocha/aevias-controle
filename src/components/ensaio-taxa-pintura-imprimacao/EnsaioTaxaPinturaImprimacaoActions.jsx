import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnsaioTaxaPinturaImprimacaoActions({ saving, isEditable, onSubmit }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(createPageUrl('MeusEnsaios'))}
        className="hover:bg-black/10"
      >
        Cancelar
      </Button>
      {isEditable && (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={(e) => onSubmit(e, 'rascunho')}
            className="border-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/10"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
            Salvar Progresso
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={(e) => onSubmit(e, 'finalizado')}
            className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Finalizar
          </Button>
        </>
      )}
    </div>
  );
}