import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnsaioRompimentoConcretoActions({ saving, onSave }) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-4 justify-end">
      <Button variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} className="border-white/20 text-[#00233B]">
        Cancelar
      </Button>
      <Button onClick={() => onSave(false)} disabled={saving} className="bg-[#00233B] text-white hover:bg-[#00233B]/90">
        {saving ? 'Salvando...' : 'Salvar Rascunho'}
      </Button>
      <Button onClick={() => onSave(true)} disabled={saving} className="bg-[#566E3D] text-white hover:bg-[#566E3D]/90">
        {saving ? 'Salvando...' : 'Finalizar'}
      </Button>
    </div>
  );
}