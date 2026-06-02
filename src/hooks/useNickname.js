import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { QUERY_KEYS } from '@/hooks/useQueryData';

/**
 * Gerencia a edição e salvamento do nickname do usuário atual.
 * Valida unicidade antes de salvar — nickname não pode estar em uso por outro usuário.
 * Após salvar, invalida a query de currentUser para refletir imediatamente.
 */
export function useNickname(user) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openEdit = () => {
    setValue(user?.nickname ?? '');
    setError('');
    setEditing(true);
  };

  const cancel = () => {
    setError('');
    setEditing(false);
  };

  const save = async () => {
    const trimmed = value.trim();

    if (!trimmed) {
      setError('O apelido não pode ser vazio.');
      return;
    }

    // Se não mudou, apenas fecha
    if (trimmed === user?.nickname) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError('');

    // Verificar unicidade: busca usuários com mesmo nickname
    const existing = await base44.entities.User.filter({ nickname: trimmed });
    const takenByAnother = existing.some(u => u.id !== user?.id);

    if (takenByAnother) {
      setError('Este apelido já está em uso. Escolha outro.');
      setSaving(false);
      return;
    }

    await base44.auth.updateMe({ nickname: trimmed });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
    setSaving(false);
    setEditing(false);
  };

  return { editing, value, setValue, saving, error, openEdit, cancel, save };
}