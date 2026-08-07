import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { hasExcelExporter, exportRecordToExcel } from '@/utils/excel/exportRegistry';

/**
 * Botão de exportação para Excel de um registro.
 * Só aparece para tipos que já possuem exportador sob medida.
 *
 * variant="icon" → compacto, para a lista de registros
 * variant="full" → com rótulo, para a barra de ações dos relatórios
 */
export default function ExcelExportButton({ record, variant = 'icon' }) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  if (!record || !hasExcelExporter(record.entityType)) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportRecordToExcel(record);
    } catch (err) {
      toast({
        title: 'Erro ao exportar Excel',
        description: err.message || 'Não foi possível gerar a planilha.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const Icon = exporting ? Loader2 : FileSpreadsheet;
  const iconClass = exporting ? 'w-4 h-4 animate-spin' : 'w-4 h-4';

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        className="text-foreground hover:bg-muted h-7 px-2 shrink-0"
        title="Exportar para Excel"
        aria-label="Exportar para Excel"
      >
        <Icon className={exporting ? 'w-3 h-3 animate-spin' : 'w-3 h-3'} />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      className="bg-[#566E3D] text-white hover:bg-[#455A31]"
    >
      <Icon className={`${iconClass} mr-2`} />
      {exporting ? 'Gerando...' : 'Excel'}
    </Button>
  );
}