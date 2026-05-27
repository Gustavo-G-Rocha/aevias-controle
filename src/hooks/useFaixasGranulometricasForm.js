import { useState, useCallback } from 'react';

export function useFaixasGranulometricasForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaixa, setEditingFaixa] = useState(null);
  const [selectedFaixa, setSelectedFaixa] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState('all');

  const handleEdit = useCallback((faixa) => {
    setEditingFaixa(faixa);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingFaixa(null);
  }, []);

  const handleOpenForm = useCallback(() => {
    setEditingFaixa(null);
    setIsFormOpen(true);
  }, []);

  const handleSelectFaixa = useCallback((faixa) => {
    setSelectedFaixa(faixa);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedFaixa(null);
  }, []);

  return {
    isFormOpen,
    setIsFormOpen,
    editingFaixa,
    setEditingFaixa,
    selectedFaixa,
    setSelectedFaixa,
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    handleEdit,
    handleCloseForm,
    handleOpenForm,
    handleSelectFaixa,
    handleCloseDetails
  };
}