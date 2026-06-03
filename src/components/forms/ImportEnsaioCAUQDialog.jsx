/**
 * ImportEnsaioCAUQDialog
 * Dialog para importar uma planilha XLSX padrão de EnsaioCAUQ.
 * Usa a mesma estrutura gerada pela exportação.
 */
import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useImportEnsaioCAUQ } from '@/hooks/useImportEnsaioCAUQ';

export default function ImportEnsaioCAUQDialog({ open, onOpenChange, obras, onSuccess }) {
  const [selectedObraId, setSelectedObraId] = useState('');
  const [file, setFile]                     = useState(null);
  const fileInputRef = useRef(null);

  const { importar, loading, error, result } = useImportEnsaioCAUQ({
    obraId: selectedObraId,
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      alert('Selecione um arquivo .xlsx ou .xls');
      return;
    }
    setFile(f);
  };

  const handleImport = async () => {
    if (!file || !selectedObraId) return;
    await importar(file);
  };

  const handleClose = () => {
    setFile(null);
    setSelectedObraId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Importar Planilha CAUQ
          </DialogTitle>
          <DialogDescription>
            Importe uma planilha no formato padrão de exportação CAUQ para criar um novo ensaio.
          </DialogDescription>
        </DialogHeader>

        {/* Resultado de sucesso */}
        {result && (
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Ensaio importado com sucesso!</p>
              <p className="text-xs text-green-700 mt-0.5">ID: {result.id}</p>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!result && (
          <div className="space-y-4">
            {/* Seleção de obra */}
            <div className="space-y-1.5">
              <Label>Obra *</Label>
              <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra de destino" />
                </SelectTrigger>
                <SelectContent>
                  {(obras || []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload do arquivo */}
            <div className="space-y-1.5">
              <Label>Arquivo Excel *</Label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Clique para selecionar</p>
                    <p className="text-xs text-slate-400 mt-1">Arquivos .xlsx ou .xls</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || !selectedObraId || loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importando...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" />Importar</>
                )}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}