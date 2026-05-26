import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Search, Loader2, ArrowLeftRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
      <div className="flex justify-center items-center h-screen bg-[#F2F1EF]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00233B]/40" />
          <p className="text-[#00233B]/60 mt-2">Carregando regionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#F2F1EF] min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00233B] flex items-center gap-3">
              <MapPin className="w-8 h-8 text-[#566E3D]" />
              Regionais
            </h1>
            <p className="text-[#00233B]/80 mt-2">
              {isAdmin ? "Gerencie as regionais e suas obras" : "Visualize as regionais e obras"}
            </p>
          </div>

          {isLaboratorista && (
            <Button onClick={() => setIsTransferenciaModalOpen(true)} className="bg-[#00233B] hover:bg-[#00233B]/90 text-[#F2F1EF]">
              <ArrowLeftRight className="w-4 h-4 mr-2 text-[#BFCF99]" />
              Solicitar Transferência
            </Button>
          )}

          {canManage && !isLaboratorista && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00233B] hover:bg-[#00233B]/90 text-[#F2F1EF]">
                  <Plus className="w-4 h-4 mr-2 text-[#BFCF99]" />
                  Nova Regional
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F2F1EF]/95 backdrop-blur-lg border border-[#00233B]/20 text-[#00233B]">
                <DialogHeader>
                  <DialogTitle className="text-[#00233B]">
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
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-[#00233B]/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#00233B]/60" />
                <Input
                  placeholder="Pesquisar regionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-[#00233B]/20 text-[#00233B]"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-[#00233B]/20 rounded-md bg-white text-sm text-[#00233B]"
                >
                  <option value="all">Todas as Obras</option>
                  <option value="planejamento">Planejamento</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="pausada">Pausada</option>
                </select>
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
          <Card className="bg-white/80 backdrop-blur-sm border border-[#00233B]/10 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-[#00233B]/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-[#00233B]/30" />
              </div>
              <h3 className="text-lg font-semibold text-[#00233B] mb-2">Nenhuma regional encontrada</h3>
              <p className="text-[#00233B]/70 text-center">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F2F1EF]/95 backdrop-blur-lg border border-[#00233B]/20 text-[#00233B]">
          <DialogHeader>
            <DialogTitle className="text-[#00233B]">Detalhes da Regional</DialogTitle>
          </DialogHeader>
          {selectedRegional && (
            <RegionalDetails regional={selectedRegional} users={users} projects={projects} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}