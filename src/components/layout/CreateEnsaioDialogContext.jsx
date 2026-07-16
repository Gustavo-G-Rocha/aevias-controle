import { createContext, useContext, useCallback } from 'react';

/**
 * Permite que qualquer componente dentro da árvore do app (sidebar, FAB do
 * Dashboard, etc.) abra o diálogo "Iniciar Novo Registro" controlado pelo Layout,
 * sem precisar de <DialogTrigger> — que exigiria um <Dialog> ancestral e, quando
 * o <Dialog> envolvia toda a app, conflitava com a troca de rota via framer-motion.
 */
const CreateEnsaioDialogContext = createContext({ openCreateEnsaio: () => {} });

export const useCreateEnsaioDialog = () => useContext(CreateEnsaioDialogContext);

export function CreateEnsaioDialogProvider({ children, onOpen }) {
  const openCreateEnsaio = useCallback(() => onOpen(true), [onOpen]);
  return (
    <CreateEnsaioDialogContext.Provider value={{ openCreateEnsaio }}>
      {children}
    </CreateEnsaioDialogContext.Provider>
  );
}