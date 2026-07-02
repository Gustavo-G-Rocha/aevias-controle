import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnsaioVigaBenkelmanHeader({ editId }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl('MeusEnsaios'))}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>
      <h1 className="text-3xl font-bold text-foreground">
        {editId ? 'Editar Ensaio Viga Benkelman' : 'Novo Ensaio Viga Benkelman'}
      </h1>
    </div>
  );
}