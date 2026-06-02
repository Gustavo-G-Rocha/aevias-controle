import React from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useNickname } from '@/hooks/useNickname';

/**
 * Exibe o nome/nickname do usuário com opção inline de edição.
 * Após salvar, invalida o cache do usuário via React Query.
 */
export default function NicknameEditor({ user }) {
  const { editing, value, setValue, saving, openEdit, cancel, save } = useNickname(user);

  const displayName = user?.nickname?.trim() || user?.full_name || '';

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          className="bg-white/20 text-white placeholder-white/50 border border-white/40 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-white/70 w-48"
          placeholder="Seu apelido..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          maxLength={40}
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-white/80 hover:text-white transition-colors"
          title="Salvar"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button
          onClick={cancel}
          className="text-white/60 hover:text-white transition-colors"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-white/80">
        Bem-vindo(a), <span className="font-semibold">{displayName}</span>.
      </p>
      <button
        onClick={openEdit}
        className="text-white/50 hover:text-white/90 transition-colors"
        title="Editar apelido"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}