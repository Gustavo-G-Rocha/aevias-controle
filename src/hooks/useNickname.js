import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { QUERY_KEYS } from '@/hooks/useQueryData';

/**
 * Gerencia a edição e salvamento do nickname do usuário atual.
 * Após salvar, invalida a query de currentUser para refletir imediatamente.
 */
export function useNickname(user) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setValue(user?.nickname ?? '');
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe({ nickname: value.trim() });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
    setSaving(false);
    setEditing(false);
  };

  return { editing, value, setValue, saving, openEdit, cancel, save };
}