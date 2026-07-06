import React, { useState, useCallback, useMemo } from "react";
import { atualizarRegistro } from "@/services/recordsService";
import { filtrarProdutividade, atualizarProdutividade, criarProdutividade } from "@/services/produtividadeService";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useProdutividadeData } from "@/hooks/useProdutividadeData";
import ProdutividadeHeader from "@/components/produtividade/ProdutividadeHeader";
import ProdutividadeTable from "@/components/produtividade/ProdutividadeTable";
import { EditRegistroDialog, MarcaDiaDialog } from "@/components/produtividade/ProdutividadeModals";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export default function ProdutividadePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editDialog, setEditDialog] = useState({ open: false, registro: null });
  const [diaDialog, setDiaDialog] = useState({ open: false, laborista: null, dia: null });
  const [cacheDias, setCacheDias] = useState({});

  const {
    loading,
    user,
    laboratoristas,
    produtividade,
    empreiteiras,
    usinas,
    marcadoresDiaRef,
    loadData,
  } = useProdutividadeData(currentMonth);

  const previousMonth = useCallback(() =>
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), []);

  const nextMonth = useCallback(() =>
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), []);

  const userCanEdit = useMemo(() =>
    user?.role === 'admin' ||
    user?.access_level === 'admin' ||
    user?.access_level === 'gestor_contrato' ||
    user?.access_level === 'sala_tecnica_afirmaevias',
  [user]);

  const handleSaveEmpreiteiraOuUsina = useCallback(async (novoValor, tipo) => {
    if (!editDialog.registro) return;
    try {
      const entityName = editDialog.registro.entityName;
      const updateData = tipo === 'empreiteira'
        ? { empreiteira: novoValor }
        : { usina_selecionada: novoValor, usina: novoValor };
      await atualizarRegistro(entityName, editDialog.registro.id, updateData);
      setEditDialog({ open: false, registro: null });
      await loadData();
    } catch (error) {
      logger.error("[Produtividade] Erro ao salvar:", error?.message || error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  }, [editDialog.registro, loadData]);

  const handleSaveDiaStatus = (status) => {
    if (!diaDialog.laborista || !diaDialog.dia) return;
    const key = `${diaDialog.laborista.toLowerCase()}_${diaDialog.dia}`;
    const dataStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(diaDialog.dia).padStart(2, '0')}`;
    setCacheDias(prev => ({ ...prev, [key]: { status, data: dataStr, laborista: diaDialog.laborista } }));
    marcadoresDiaRef.current[key] = status;
    setDiaDialog({ open: false, laborista: null, dia: null });
  };

  const handleEditClick = useCallback((reg) => setEditDialog({ open: true, registro: reg }), []);
  const handleMarkerClick = useCallback((email, dia) => setDiaDialog({ open: true, laborista: email, dia }), []);

  const { days, isFutureDay } = useMemo(() => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();
    const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth();
    return {
      days: daysArr,
      isFutureDay: (day) => isCurrentMonth && day > today.getDate(),
    };
  }, [currentMonth]);

  const handleSaveCache = async () => {
    if (Object.keys(cacheDias).length === 0) { toast({ title: "Nenhuma alteração para salvar" }); return; }
    try {
      for (const [, item] of Object.entries(cacheDias)) {
        const existente = await filtrarProdutividade({
          laboratorista_email: item.laborista,
          data: item.data
        });
        if (existente.length > 0) {
          await atualizarProdutividade(existente[0].id, { status: item.status });
        } else {
          await criarProdutividade({
            laboratorista_email: item.laborista,
            data: item.data,
            status: item.status
          });
        }
      }
      setCacheDias({});
      toast({ title: "Dados salvos com sucesso!" });
    } catch (error) {
      logger.error("[Produtividade] Erro ao salvar marcadores:", error?.message || error);
      toast({ title: "Erro ao salvar dados", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[95vw] mx-auto">
        <Card className="bg-card border-border">
          <ProdutividadeHeader
            currentMonth={currentMonth}
            onPreviousMonth={previousMonth}
            onNextMonth={nextMonth}
            cacheDiasCount={Object.keys(cacheDias).length}
            userCanEdit={userCanEdit}
            onSaveCache={handleSaveCache}
          />
          <CardContent>
            <ProdutividadeTable
              laboratoristas={laboratoristas}
              produtividade={produtividade}
              marcadoresDiaRef={marcadoresDiaRef}
              days={days}
              currentMonth={currentMonth}
              isFutureDay={isFutureDay}
              userCanEdit={userCanEdit}
              onEditClick={handleEditClick}
              onMarkerClick={handleMarkerClick}
            />
          </CardContent>
        </Card>
      </div>

      <EditRegistroDialog
        open={editDialog.open}
        registro={editDialog.registro}
        empreiteiras={empreiteiras}
        usinas={usinas}
        onSave={handleSaveEmpreiteiraOuUsina}
        onClose={() => setEditDialog({ open: false, registro: null })}
      />

      <MarcaDiaDialog
        open={diaDialog.open}
        dia={diaDialog.dia}
        onSave={handleSaveDiaStatus}
        onClose={() => setDiaDialog({ open: false, laborista: null, dia: null })}
      />
    </div>
  );
}