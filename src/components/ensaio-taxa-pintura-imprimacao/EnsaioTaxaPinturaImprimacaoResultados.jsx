import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

export default function EnsaioTaxaPinturaImprimacaoResultados({
  formData,
  isEditable,
  onEnsaioChange,
  onAdicionarEnsaio,
  onRemoverEnsaio,
  onFieldChange,
}) {
  return (
    <div className="space-y-6">
      {/* Lista de Ensaios */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#00233B]">Ensaios (máximo 4)</h3>
          {isEditable && (
            <Button
              type="button"
              onClick={onAdicionarEnsaio}
              className="bg-[#00233B] text-[#F2F1EF]"
              disabled={formData.ensaios.length >= 4}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ensaio
            </Button>
          )}
        </div>

        {formData.ensaios.map((ensaio, index) => (
          <Card key={index} className="mb-4 bg-black/5">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Ensaio {ensaio.numero}</CardTitle>
                {isEditable && formData.ensaios.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoverEnsaio(index, formData.ensaios.length)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Identificação */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Hora</Label>
                  <Input type="time" value={ensaio.hora} onChange={(e) => onEnsaioChange(index, 'hora', e.target.value)} disabled={!isEditable} />
                </div>
                <div>
                  <Label>Camada</Label>
                  <Input value={ensaio.camada} onChange={(e) => onEnsaioChange(index, 'camada', e.target.value)} disabled={!isEditable} placeholder="Ex: Imprimação" />
                </div>
                <div>
                  <Label>Material da Camada</Label>
                  <Input value={ensaio.material_camada} onChange={(e) => onEnsaioChange(index, 'material_camada', e.target.value)} disabled={!isEditable} placeholder="Ex: CM-30" />
                </div>
                <div>
                  <Label>Estaca</Label>
                  <Input value={ensaio.estaca} onChange={(e) => onEnsaioChange(index, 'estaca', e.target.value)} disabled={!isEditable} placeholder="Ex: E-245" />
                </div>
              </div>

              {/* Execução do Ensaio */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Execução do Ensaio</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Temp. Aplicação (°C)</Label>
                    <Input type="number" step="0.1" value={ensaio.temperatura_aplicacao || ''} onChange={(e) => onEnsaioChange(index, 'temperatura_aplicacao', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
                  </div>
                  <div>
                    <Label>Peso Bandeja+Amostra (g)</Label>
                    <Input type="number" step="0.1" value={ensaio.peso_bandeja_amostra || ''} onChange={(e) => onEnsaioChange(index, 'peso_bandeja_amostra', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
                  </div>
                  <div>
                    <Label>Peso da Bandeja (g)</Label>
                    <Input type="number" step="0.1" value={ensaio.peso_bandeja || ''} onChange={(e) => onEnsaioChange(index, 'peso_bandeja', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
                  </div>
                </div>
              </div>

              {/* Ensaio de Resíduo */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Ensaio de Resíduo</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={ensaio.ensaio_residuo?.data || ''} onChange={(e) => onEnsaioChange(index, 'ensaio_residuo.data', e.target.value)} disabled={!isEditable} />
                  </div>
                  <div>
                    <Label>Tara (g)</Label>
                    <Input type="number" step="0.1" value={ensaio.ensaio_residuo?.tara || ''} onChange={(e) => onEnsaioChange(index, 'ensaio_residuo.tara', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
                  </div>
                  <div>
                    <Label>Peso Inicial (g)</Label>
                    <Input type="number" step="0.1" value={ensaio.ensaio_residuo?.peso_inicial || ''} onChange={(e) => onEnsaioChange(index, 'ensaio_residuo.peso_inicial', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
                  </div>
                  <div>
                    <Label>Peso Final (g)</Label>
                    <Input type="number" step="0.1" value={ensaio.ensaio_residuo?.peso_final || ''} onChange={(e) => onEnsaioChange(index, 'ensaio_residuo.peso_final', e.target.value ? parseFloat(e.target.value) : null)} disabled={!isEditable} />
                  </div>
                </div>
              </div>

              {/* Resultados Calculados */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="p-3 bg-blue-50 rounded">
                  <Label className="text-xs text-blue-800">Peso da Emulsão (g)</Label>
                  <p className="text-lg font-bold text-blue-900">{ensaio.peso_emulsao?.toFixed(2) || '-'}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <Label className="text-xs text-blue-800">Taxa Aplicada (l/m²)</Label>
                  <p className="text-lg font-bold text-blue-900">{ensaio.taxa_aplicada?.toFixed(2) || '-'}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <Label className="text-xs text-green-800">Resíduo (%)</Label>
                  <p className="text-lg font-bold text-green-900">{ensaio.ensaio_residuo?.residuo?.toFixed(2) || '-'}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <Label className="text-xs text-green-800">Taxa Emulsão Aplicada (l/m²)</Label>
                  <p className="text-lg font-bold text-green-900">{ensaio.taxa_emulsao_aplicada?.toFixed(2) || '-'}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <Label className="text-xs text-green-800">Taxa Residual (l/m²)</Label>
                  <p className="text-lg font-bold text-green-900">{ensaio.taxa_residual?.toFixed(2) || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => onFieldChange('observacoes', e.target.value)}
          disabled={!isEditable}
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );
}