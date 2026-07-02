import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Eye, Trash2, Grid, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import FaixaForm from "@/components/faixas-granulometricas/FaixaForm";
import FaixaDetails from "@/components/faixas-granulometricas/FaixaDetails";
import { useFaixasGranulometricasData } from "@/hooks/useFaixasGranulometricasData";
import { useFaixasGranulometricasForm } from "@/hooks/useFaixasGranulometricasForm";
import { useFaixasGranulometricasActions } from "@/hooks/useFaixasGranulometricasActions";
import { 
  filterFaixas, 
  canUserManage, 
  TIPO_CORES 
} from "@/utils/faixasGranulometricasUtils";

export default function FaixasGranulometricasPage() {
  // Data hook
  const { faixas, user, loading, loadData } = useFaixasGranulometricasData();

  // Form hook
  const {
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
    handleCloseDetails
  } = useFaixasGranulometricasForm();

  // Actions hook
  const { handleSaveFaixa, handleDelete } = useFaixasGranulometricasActions(loadData);

  // Filter faixas
  const filteredFaixas = useMemo(() => 
    filterFaixas(faixas, searchTerm, tipoFilter),
    [faixas, searchTerm, tipoFilter]
  );

  // Access control
  const canManage = canUserManage(user);
  const tipoProjetoColors = useMemo(() => TIPO_CORES, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#BFCF99]" />
          <p className="text-muted-foreground mt-2">Carregando faixas granulométricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Grid className="w-8 h-8 text-foreground"/>
              Faixas Granulométricas
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie as especificações de faixas granulométricas.</p>
          </div>
          {canManage && (
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingFaixa(null);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Faixa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingFaixa ? 'Editar Faixa Granulométrica' : 'Nova Faixa Granulométrica'}
                  </DialogTitle>
                </DialogHeader>
                <FaixaForm
                  faixa={editingFaixa}
                  onSave={(faixaData) => handleSaveFaixa(faixaData, editingFaixa).then(() => handleCloseForm()).catch(() => {})}
                  onCancel={handleCloseForm}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#BFCF99]" />
                <Input
                  placeholder="Pesquisar faixas granulométricas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:border-[#BFCF99] focus:ring-[#BFCF99]"
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="CAUQ">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">CAUQ</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="MRAF">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">MRAF</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="BGS">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500">BGS</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="CAMADAS_GRANULARES">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-500">CAMADAS GRANULARES</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Especificação</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Órgão</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                {(canManage || !canManage) && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFaixas.map((faixa) => (
                <tr key={faixa.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={tipoProjetoColors[faixa.tipo || 'CAUQ']}>
                      {faixa.tipo || 'CAUQ'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{faixa.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{faixa.especificacao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{faixa.orgao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={
                      faixa.status === 'ativo' 
                        ? "bg-green-200/50 text-green-800" 
                        : "bg-red-200/50 text-red-800"
                    }>
                      {faixa.status || 'ativo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFaixa(faixa)} className="text-foreground">
                      <Eye className="w-4 h-4 mr-1 text-[#BFCF99]" /> Ver
                    </Button>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(faixa)} className="text-foreground">
                          <Edit className="w-4 h-4 mr-1 text-[#BFCF99]" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(faixa.id, loadData)} className="text-red-500 hover:text-red-700 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFaixas.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Nenhuma faixa encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Ajuste sua busca ou adicione uma nova faixa granulométrica.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={!!selectedFaixa} onOpenChange={() => handleCloseDetails()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes da Faixa Granulométrica</DialogTitle>
          </DialogHeader>
          {selectedFaixa && (
            <FaixaDetails faixa={selectedFaixa} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}