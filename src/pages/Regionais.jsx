import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Search, Loader2, ArrowLeftRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useRegionaisData } from "@/hooks/useRegionaisData";
import { useRegionaisFilters } from "@/hooks/useRegionaisFilters";
import { useRegionaisActions } from "@/hooks/useRegionaisActions";
import { calcularPermissoes, getUserAccessLevel } from "@/utils/regionaisUtils";

import RegionalCard from "@/components/regionais/RegionalCard";
import RegionalForm from "@/components/regionais/RegionalForm";
import RegionalDetails from "@/components/regionais/RegionalDetails";
import SolicitarTransferenciaRegionalModal from "@/components/obras/SolicitarTransferenciaRegionalModal";

export default function RegionaisPage() {
  const { regionais, todasRegionais, obras, users, projects, user, loading, loadData } = useRegionaisData();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredRegionais } = useRegionaisFilters(regionais);
  const { isFormOpen, setIsFormOpen, editingRegional, setEditingRegional, handleSaveRegional, handleEdit, handleDelete } = useRegionaisActions(loadData);

  const [selectedRegional, setSelectedRegional] = useState(null);
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);

  const accessLevel = getUserAccessLevel(user);
  const { isAdmin, isLaboratorista, canManage } = calcularPermissoes(accessLevel);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--color-text-subtle)' }} />
          <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>Carregando regionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
              <MapPin className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
              Regionais
            </h1>
            <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {isAdmin ? "Gerencie as regionais e suas obras" : "Visualize as regionais e obras"}
            </p>
          </div>

          {isLaboratorista && (
            <Button onClick={() => setIsTransferenciaModalOpen(true)} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
              <ArrowLeftRight className="w-4 h-4 mr-2" style={{ color: 'var(--color-accent)' }} />
              Solicitar Transferência
            </Button>
          )}

          {canManage && !isLaboratorista && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
                  <Plus className="w-4 h-4 mr-2" style={{ color: 'var(--color-accent)' }} />
                  Nova Regional
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                <DialogHeader>
                  <DialogTitle style={{ color: 'var(--color-text)' }}>
                    {editingRegional ? 'Editar Regional' : 'Nova Regional'}
                  </DialogTitle>
                </DialogHeader>
                <RegionalForm
                  regional={editingRegional}
                  users={users}
                  projects={projects}
                  onSave={handleSaveRegional}
                  onCancel={() => { setIsFormOpen(false); setEditingRegional(null); }}
                  isAdmin={isAdmin}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filtros */}
        <Card className="mb-6 border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input
                  placeholder="Pesquisar regionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
                    <SelectValue placeholder="Todas as Obras" />
                  </SelectTrigger>
                  <SelectContent title="Filtrar por status">
                    <SelectItem value="all">Todas as Obras</SelectItem>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de regionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegionais.map((regional) => (
            <RegionalCard
              key={regional.id}
              regional={regional}
              obras={obras}
              users={users}
              projects={projects}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onObraAdded={loadData}
              canManage={canManage}
              isAdmin={isAdmin}
              statusFilter={statusFilter}
              isLaboratorista={isLaboratorista}
              setSelectedRegional={setSelectedRegional}
            />
          ))}
        </div>

        {filteredRegionais.length === 0 && (
          <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--card-shadow)' }}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-secondary-subtle)' }}>
                <MapPin className="w-8 h-8" style={{ color: 'var(--color-text-subtle)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Nenhuma regional encontrada</h3>
              <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>
                {searchTerm ? 'Tente ajustar seus filtros de pesquisa.' : 'Comece criando sua primeira regional.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {isLaboratorista && user && (
        <SolicitarTransferenciaRegionalModal
          isOpen={isTransferenciaModalOpen}
          onClose={() => setIsTransferenciaModalOpen(false)}
          user={user}
          regionalAtual={regionais[0]}
          todasRegionais={todasRegionais}
          onSuccess={() => setIsTransferenciaModalOpen(false)}
        />
      )}

      {/* Regional Details Dialog */}
      <Dialog open={!!selectedRegional} onOpenChange={(open) => !open && setSelectedRegional(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--color-text)' }}>Detalhes da Regional</DialogTitle>
          </DialogHeader>
          {selectedRegional && (
            <RegionalDetails regional={selectedRegional} users={users} projects={projects} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}