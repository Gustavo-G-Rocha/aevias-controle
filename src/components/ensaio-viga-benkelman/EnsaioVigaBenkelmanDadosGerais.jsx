import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function EnsaioVigaBenkelmanDadosGerais({
  formData,
  obras,
  onObraChange,
  onInputChange,
  onLeituraInicialChange,
}) {
  const obraAtual = obras.find(o => o.id === formData.obra_id);
  const rodoviasDaObra = obraAtual?.rodovias || [];

  return (
    <div className="space-y-6">
      {/* Dados da Obra */}
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader className="bg-[#BFCF99]/20 border-b border-white/10">
          <CardTitle className="text-[#00233B]">Dados da Obra</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Obra*</span>
              <select
                value={formData.obra_id}
                onChange={(e) => onObraChange(e.target.value, obras)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-[#00233B]"
              >
                <option value="">Selecionar obra...</option>
                {obras.map(obra => (
                  <option key={obra.id} value={obra.id}>{obra.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Rodovia</span>
              <select
                value={formData.rodovia}
                onChange={(e) => onInputChange('rodovia', e.target.value)}
                disabled={!formData.obra_id}
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-[#00233B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecionar rodovia...</option>
                {rodoviasDaObra.map((rodovia, idx) => (
                  <option key={idx} value={rodovia}>{rodovia}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Trecho</span>
              <Input value={formData.trecho} onChange={(e) => onInputChange('trecho', e.target.value)} placeholder="Digitar" className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Material</span>
              <Input value={formData.material} onChange={(e) => onInputChange('material', e.target.value)} placeholder="Digitar" className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Procedência</span>
              <Input value={formData.procedencia} onChange={(e) => onInputChange('procedencia', e.target.value)} placeholder="Digitar" className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>

            <div className="hidden">
              <span className="block text-sm font-medium text-[#00233B] mb-2">Pista/Faixa</span>
              <Input value={formData.pista_faixa} onChange={(e) => onInputChange('pista_faixa', e.target.value)} placeholder="Digitar" className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Camada</span>
              <Input value={formData.camada} onChange={(e) => onInputChange('camada', e.target.value)} placeholder="Digitar" className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Data de Aplicação da Camada</span>
              <Input type="date" value={formData.data_ensaio} onChange={(e) => onInputChange('data_ensaio', e.target.value)} className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Data de Realização do Ensaio</span>
              <Input type="date" value={formData.data_realizacao} onChange={(e) => onInputChange('data_realizacao', e.target.value)} className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Ensaio */}
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader className="bg-[#BFCF99]/20 border-b border-white/10">
          <CardTitle className="text-[#00233B]">Dados do Ensaio</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">Laboratorista</span>
              <Input value={formData.laboratorista_name} disabled className="bg-white/10 border-white/20 text-[#00233B]/70" />
            </div>
            <div>
              <span className="block text-sm font-medium text-[#00233B] mb-2">CTE. VIGA</span>
              <Input value={formData.cte_viga} onChange={(e) => onInputChange('cte_viga', e.target.value)} placeholder="Digitar" className="bg-white/10 border-white/20 text-[#00233B]" />
            </div>
            <div>
              <label htmlFor="def_admissivel" className="block text-sm font-medium text-[#00233B] mb-2">DEF. ADMISSÍVEL</label>
              <Input
                id="def_admissivel"
                value={formData.def_admissivel}
                onChange={(e) => onInputChange('def_admissivel', e.target.value.replace(/[^\d]/g, ''))}
                placeholder="Digitar"
                className="bg-white/10 border-white/20 text-[#00233B]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leitura Inicial Global */}
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader className="bg-[#BFCF99]/20 border-b border-white/10">
          <CardTitle className="text-[#00233B]">Leitura Inicial (Única)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-[#00233B]/80">
            Informe a leitura inicial uma única vez. Ela será automaticamente preenchida em todos os registros.
          </p>
          <div className="flex-1">
            <label htmlFor="leitura_inicial_global" className="block text-sm font-medium text-[#00233B] mb-2">Leitura Inicial (A)</label>
            <Input
              id="leitura_inicial_global"
              type="number"
              step="0.01"
              value={formData.leitura_inicial_global}
              onChange={(e) => onLeituraInicialChange(e.target.value)}
              placeholder="Digitar"
              className="bg-white/10 border-white/20 text-[#00233B]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}