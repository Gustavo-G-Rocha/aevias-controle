// Botão de exportação de vários registros — cada um em uma aba da planilha
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportRecordsToExcel } from "@/utils/excel/exportRegistry";

export default function BulkExcelExportButton({ records = [] }) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      await exportRecordsToExcel(records, `registros_${data}.xlsx`);
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: error?.message || "Não foi possível gerar a planilha.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exporting || records.length === 0}
      className="h-9"
      title="Exportar registros selecionados para Excel"
    >
      {exporting
        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        : <FileSpreadsheet className="mr-2 h-4 w-4" />}
      Exportar Excel ({records.length})
    </Button>
  );
}