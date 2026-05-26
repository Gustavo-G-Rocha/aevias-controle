/**
 * Card de uma Regional com obras colapsáveis, ações CRUD de obras e navegação.
 * Extraído de Regionais.jsx onde era um componente inline `RegionalCard`.
 */
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Construction as ConstructionIcon, Users as UsersIcon, ChevronDown, ChevronUp, FileText, HardHat, Construction, Wrench, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Obra } from "@/entities/Obra";
import ObraForm from "./ObraForm";
import {
  STATUS_COLORS_REGIONAL,
  STATUS_COLORS_OBRA,
  TIPO_OBRA_LABELS,
  filtrarObrasPorStatus,
  getProjetosNaRegional,
} from "@/utils/regionaisUtils";

const tipoObraIcons = {
  supervisao: <HardHat className="w-3 h-3 text-blue-600" />,
  implantacao: <Construction className="w-3 h-3 text-green-600" />,
  conservacao: <Wrench className="w-3 h-3 text-amber-600" />,
  sondagem: <FileText className="w-3 h-3 text-purple-600" />,
  levantamentos: <FileText className="w-3 h-3 text-teal-600" />,
};

const RegionalCard = React.memo(({ regional, obras, users, projects, onEdit, onDelete, onObraAdded, canManage, isAdmin, statusFilter, isLaboratorista, setSelectedRegional }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isObraDialogOpen, setIsObraDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState(null);

  const obrasNaRegional = useMemo(
    () => filtrarObrasPorStatus(obras, regional.id, statusFilter),
    [obras, regional.id, statusFilter]
  );

  const projetosNaRegional = useMemo(
    () => getProjetosNaRegional(projects, regional),
    [projects, regional]
  );

  const laboratoristasCount = useMemo(
    () => (regional.laboratoristas_responsaveis || []).length,
    [regional.laboratoristas_responsaveis]
  );

  const handleSaveObra = useCallback(async (obraData) => {
    try {
      const dataToSave = {
        ...obraData,
        regional_id: editingObra ? editingObra.regional_id : regional.id,
      };
      const cleanedData = Object.fromEntries(
        Object.entries(dataToSave).filter(([, v]) => v !== "" && v !== null)
      );
      if (editingObra) {
        await Obra.update(editingObra.id, cleanedData);
        alert("Obra atualizada com sucesso!");
      } else {
        await Obra.create(cleanedData);
        alert("Obra criada com sucesso!");
      }
      setIsObraDialogOpen(false);
      setEditingObra(null);
      onObraAdded();
    } catch (error) {
      console.error("[Regionais] Erro ao salvar obra:", error?.message || error);
      alert(`Erro ao salvar obra: ${error.message}`);
    }
  }, [editingObra, regional.id, onObraAdded]);

  const handleDeleteObra = useCallback(async (obraId) => {
    if (window.confirm("Tem certeza que deseja excluir esta obra?")) {
      try {
        await Obra.delete(obraId);
        onObraAdded();
      } catch (error) {
        console.error("[Regionais] Erro ao excluir obra:", error?.message || error);
        alert("Erro ao excluir obra.");
      }
    }
  }, [onObraAdded]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-[#00233B]/10 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-[#00233B] line-clamp-1">{regional.nome}</CardTitle>
            <p className="text-sm text-[#00233B]/70">{regional.codigo}</p>
          </div>
          <Badge className={`${STATUS_COLORS_REGIONAL[regional.status] || STATUS_COLORS_REGIONAL.ativa} border`}>
            {regional.status || 'ativa'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 mb-4">
          {regional.cliente && (
            <div>
              <p className="text-sm font-medium text-[#00233B]/70">Cliente</p>
              <p className="text-sm text-[#00233B]">{regional.cliente}</p>
            </div>
          )}
          {regional.estado && (
            <div>
              <p className="text-sm font-medium text-[#00233B]/70">Estado</p>
              <p className="text-sm text-[#00233B]">{regional.estado}</p>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5" title={`${obrasNaRegional.length} obras`}>
              <ConstructionIcon className="w-4 h-4 text-[#566E3D] flex-shrink-0" />
              <span className="text-[#00233B] leading-none font-medium">{obrasNaRegional.length}</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${projetosNaRegional.length} projetos`}>
              <FileText className="w-4 h-4 text-[#566E3D] flex-shrink-0" />
              <span className="text-[#00233B] leading-none font-medium">{projetosNaRegional.length}</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${laboratoristasCount} laboratoristas`}>
              <UsersIcon className="w-4 h-4 text-[#566E3D] flex-shrink-0" />
              <span className="text-[#00233B] leading-none font-medium">{laboratoristasCount}</span>
            </div>
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 border-[#00233B]/20 text-[#00233B] hover:bg-[#00233B]/5">
                {isOpen ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {isOpen ? 'Ocultar' : 'Ver'} Obras ({obrasNaRegional.length})
              </Button>
            </CollapsibleTrigger>

            {canManage && !isLaboratorista && (
              <Dialog open={isObraDialogOpen} onOpenChange={setIsObraDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#00233B] hover:bg-[#00233B]/90 text-[#F2F1EF]">
                    <Plus className="w-4 h-4 mr-1 text-[#BFCF99]" />Nova Obra
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F2F1EF]/95 backdrop-blur-lg border border-[#00233B]/20 text-[#00233B]">
                  <DialogHeader>
                    <DialogTitle className="text-[#00233B]">
                      {editingObra ? 'Editar Obra' : `Nova Obra - ${regional.nome}`}
                    </DialogTitle>
                  </DialogHeader>
                  <ObraForm
                    obra={editingObra}
                    regional={regional}
                    onSave={handleSaveObra}
                    onCancel={() => { setIsObraDialogOpen(false); setEditingObra(null); }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <CollapsibleContent className="mt-4">
            {obrasNaRegional.length > 0 ? (
              <div className="space-y-2">
                {obrasNaRegional.map(obra => (
                  <div key={obra.id} className="p-3 bg-[#F2F1EF] rounded-lg border border-[#00233B]/10">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="font-medium text-[#00233B] truncate flex-shrink">{obra.name}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={`${STATUS_COLORS_OBRA[obra.status] || STATUS_COLORS_OBRA.planejamento} border flex-shrink-0`}>
                            {obra.status || 'planejamento'}
                          </Badge>
                          {obra.tipo_obra && (
                            <Badge variant="outline" className="flex items-center gap-1 border-[#00233B]/20 text-[#00233B] flex-shrink-0">
                              {tipoObraIcons[obra.tipo_obra]}
                              {TIPO_OBRA_LABELS[obra.tipo_obra] || obra.tipo_obra}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#00233B]/70 truncate">Contrato: {obra.code}</p>
                        {obra.location && <p className="text-xs text-[#00233B]/60 mt-1 truncate">{obra.location}</p>}

                        {obra.tipo_obra === "supervisao" && obra.empreiteiras?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-[#00233B]/60 mb-1">Empreiteiras:</p>
                            <div className="flex flex-wrap gap-1">
                              {obra.empreiteiras.map(emp => <Badge key={emp} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">{emp}</Badge>)}
                            </div>
                          </div>
                        )}
                        {(obra.tipo_obra === "levantamentos" || obra.tipo_obra === "sondagem") && obra.clientes?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-[#00233B]/60 mb-1">Clientes:</p>
                            <div className="flex flex-wrap gap-1">
                              {obra.clientes.map(c => <Badge key={c} variant="secondary" className="bg-teal-100 text-teal-800 text-xs">{c}</Badge>)}
                            </div>
                          </div>
                        )}
                        {obra.usinas?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-[#00233B]/60 mb-1">Usinas:</p>
                            <div className="flex flex-wrap gap-1">
                              {obra.usinas.map(u => <Badge key={u} variant="secondary" className="bg-green-100 text-green-800 text-xs">{u}</Badge>)}
                            </div>
                          </div>
                        )}
                        {obra.rodovias?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-[#00233B]/60 mb-1">Rodovias:</p>
                            <div className="flex flex-wrap gap-1">
                              {obra.rodovias.map(r => <Badge key={r} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">{r}</Badge>)}
                            </div>
                          </div>
                        )}
                      </div>

                      {canManage && !isLaboratorista && (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingObra(obra); setIsObraDialogOpen(true); }} className="text-[#00233B] hover:bg-[#00233B]/10 h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteObra(obra.id)} className="text-[#800020] hover:text-[#800020] hover:bg-[#800020]/10 h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#00233B]/60">
                <ConstructionIcon className="w-8 h-8 text-[#00233B]/30 mx-auto mb-2" />
                <p className="text-sm">Nenhuma obra {statusFilter !== 'all' ? `com status "${statusFilter}"` : 'cadastrada'}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="py-3 border-t border-[#00233B]/10">
        <div className="w-full flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedRegional(regional)} className="text-[#00233B] hover:bg-[#00233B]/10">
              <Eye className="w-4 h-4 mr-1 text-[#566E3D]" />Ver Detalhes
            </Button>
            {canManage && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onEdit(regional)} className="text-[#00233B] hover:bg-[#00233B]/10">
                  <Edit className="w-4 h-4 mr-1 text-[#566E3D]" />Editar
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(regional.id)} className="text-[#800020] hover:text-[#800020] hover:bg-[#800020]/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
});

RegionalCard.displayName = 'RegionalCard';
export default RegionalCard;