import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnsaioVigaBenkelmanActions({ saving, onSave }) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-4 justify-end">
      <Button
        variant="outline"
        onClick={() => navigate(createPageUrl('MeusEnsaios'))}

      >
        Cancelar
      </Button>
      <Button
        onClick={() => onSave(false)}
        disabled={saving}

      >
        {saving ? 'Salvando...' : 'Salvar Rascunho'}
      </Button>
      <Button
        onClick={() => onSave(true)}
        disabled={saving}

      >
        {saving ? 'Salvando...' : 'Finalizar'}
      </Button>
    </div>
  );
}