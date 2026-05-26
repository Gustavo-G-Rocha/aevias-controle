import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnsaioRompimentoConcretoHeader({ editId }) {
  const navigate = useNavigate();
  return (
    <>
      <Button variant="ghost" onClick={() => navigate(createPageUrl('MeusEnsaios'))} className="mb-6 text-[#00233B] hover:bg-black/5">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>
      <h1 className="text-3xl font-bold text-[#00233B] mb-6">
        {editId ? 'Editar Ensaio Rompimento Concreto' : 'Novo Ensaio Rompimento Concreto'}
      </h1>
    </>
  );
}