import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader } from 'lucide-react';
import { getDescricaoColunas } from '@/utils/impressionEtiquetasUtils';

export default function UploadSection({
  tipoEtiqueta,
  loading,
  erro,
  etiquetas,
  onTipoChange,
  onFileUpload,
  onShowRender
}) {
  return (
    <div className="min-h-screen bg-[#F2F1EF] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00233B] mb-8">Impressão de Etiquetas - Sondagem</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <span className="block text-sm font-semibold text-[#00233B] mb-2">Tipo de Etiqueta</span>
          <select
            value={tipoEtiqueta}
            onChange={(e) => onTipoChange(e.target.value)}
            className="flex h-10 w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00233B]/30"
          >
            <option value="coleta">Etiqueta de Coleta</option>
            <option value="umidade">Etiqueta de Umidade</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="border-2 border-dashed border-[#BFCF99] rounded-lg p-12 text-center">
            <Upload className="w-16 h-16 text-[#BFCF99] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#00233B] mb-2">Carregue a Planilha de Etiquetas</h2>
            <p className="text-[#00233B]/70 mb-6">
              {getDescricaoColunas(tipoEtiqueta)}
            </p>

            <input
              type="file"
              accept=".xlsx,.xlsm,.xls,.csv"
              onChange={(e) => onFileUpload(e.target.files?.[0], tipoEtiqueta)}
              disabled={loading}
              className="hidden"
              id="file-input"
            />

            <Button
              onClick={() => document.getElementById('file-input').click()}
              className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90 cursor-pointer"
              disabled={loading}
            >
              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {loading ? 'Processando...' : 'Selecionar Arquivo'}
            </Button>

            {erro && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                {erro}
              </div>
            )}
          </div>

          {etiquetas.length > 0 && (
            <div className="mt-8 p-6 bg-[#F2F1EF] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#00233B] font-semibold">Arquivo carregado com sucesso!</p>
                  <p className="text-[#00233B]/70 text-sm">{etiquetas.length} etiquetas prontas para gerar</p>
                </div>
                <Button
                  onClick={onShowRender}
                  className="bg-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/90 font-semibold"
                >
                  Gerar Etiquetas →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}