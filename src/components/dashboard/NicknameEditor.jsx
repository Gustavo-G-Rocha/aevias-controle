import React from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useNickname } from '@/hooks/useNickname';

export default function NicknameEditor({ user }) {
  const { editing, value, setValue, saving, error, openEdit, cancel, save } = useNickname(user);

  const displayName = user?.nickname?.trim() || user?.full_name || '';

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
        <input
          autoFocus
          className="bg-card/20 text-white placeholder-white/50 border border-white/40 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-white/70 w-48"
          placeholder="Seu apelido..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          maxLength={40}
        />
        <button onClick={save} disabled={saving} className="text-white/80 hover:text-white transition-colors" title="Salvar">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button onClick={cancel} className="text-white/60 hover:text-white transition-colors" title="Cancelar">
          <X className="w-4 h-4" />
        </button>
        </div>
        {error && <p className="text-red-300 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h2 className="text-2xl font-bold text-white">{displayName}</h2>
      <button onClick={openEdit} className="text-white/50 hover:text-white/90 transition-colors" title="Editar apelido">
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}