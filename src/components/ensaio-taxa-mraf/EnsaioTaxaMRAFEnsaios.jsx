import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { isNaoConforme, formatarTaxa, formatarPeso } from "@/utils/ensaioTaxaMRAFUtils";

export default function EnsaioTaxaMRAFEnsaios({
  ensaios,
  isEditable,
  taxaMinima,
  onEnsaioChange,
  onAdicionarEnsaio,
  onRemoverEnsaio
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#00233B]">Execução dos Ensaios (máx. 3)</h3>
        {isEditable && (
          <Button
            type="button"
            onClick={onAdicionarEnsaio}
            className="bg-[#00233B] text-[#F2F1EF]"
            disabled={ensaios.length >= 3}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Bandeja
          </Button>
        )}
      </div>

      {ensaios.map((ensaio, index) => (
        <Card key={index} className="mb-4 bg-black/5">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Bandeja {ensaio.numero}</CardTitle>
              {isEditable && ensaios.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoverEnsaio(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Identificação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Estaca do Ensaio</Label>
                <Input
                  value={ensaio.estaca}
                  onChange={e => onEnsaioChange(index, 'estaca', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ex: E-245"
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Posição</Label>
                <Input
                  value={ensaio.posicao}
                  onChange={e => onEnsaioChange(index, 'posicao', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ex: Faixa 1"
                  className="bg-white"
                />
              </div>
            </div>

            {/* Pesagem */}
            <h4 className="font-semibold text-sm">Pesagem</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>P₁ - Peso Bandeja+Amostra (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={ensaio.peso_bandeja_amostra ?? ''}
                  onChange={e => onEnsaioChange(index, 'peso_bandeja_amostra', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!isEditable}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>P₂ - Peso da Bandeja (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={ensaio.peso_bandeja ?? ''}
                  onChange={e => onEnsaioChange(index, 'peso_bandeja', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!isEditable}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Pₐ - Peso da Amostra (g) <span className="text-slate-500 text-xs">(calculado)</span></Label>
                <Input value={formatarPeso(ensaio.peso_amostra)} readOnly className="bg-slate-200" />
              </div>
            </div>

            {/* Parâmetros de extração */}
            <h4 className="font-semibold text-sm">Parâmetros de Extração</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>L - Teor de Ligante (%) <span className="text-slate-500 text-xs">(ensaio extração)</span></Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ensaio.teor_ligante ?? ''}
                  onChange={e => onEnsaioChange(index, 'teor_ligante', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!isEditable}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>R - Resíduo da Emulsão (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ensaio.residuo_emulsao ?? ''}
                  onChange={e => onEnsaioChange(index, 'residuo_emulsao', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!isEditable}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Resultados calculados */}
            <EnsaioResultados ensaio={ensaio} taxaMinima={taxaMinima} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Subcomponente para exibir resultados de um ensaio
 */
function EnsaioResultados({ ensaio, taxaMinima }) {
  const naoConforme = isNaoConforme(ensaio.taxa_mraf_aplicada, taxaMinima);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
      <div className={`p-3 rounded ${naoConforme ? 'bg-red-200 border border-red-400' : 'bg-blue-200'}`}>
        <Label className={`text-xs ${naoConforme ? 'text-red-800' : 'text-blue-800'}`}>Tₓ - Taxa MRAF Aplicada (kg/m²)</Label>
        <p className={`text-lg font-bold ${naoConforme ? 'text-red-900' : 'text-blue-900'}`}>{formatarTaxa(ensaio.taxa_mraf_aplicada)}</p>
        {naoConforme && <p className="text-xs font-bold text-red-700 mt-1">⚠ NÃO CONFORME (mín: {taxaMinima})</p>}
      </div>
      <div className="p-3 bg-blue-200 rounded">
        <Label className="text-xs text-blue-800">T_L - Taxa de Ligante (L/m²)</Label>
        <p className="text-lg font-bold text-blue-900">{formatarTaxa(ensaio.taxa_ligante)}</p>
      </div>
      <div className="p-3 bg-green-200 rounded">
        <Label className="text-xs text-green-800">T_E - Taxa de Emulsão (L/m²)</Label>
        <p className="text-lg font-bold text-green-900">{formatarTaxa(ensaio.taxa_emulsao)}</p>
      </div>
      <div className="p-3 bg-green-200 rounded">
        <Label className="text-xs text-green-800">T_A - Taxa de Agregado (kg/m²)</Label>
        <p className="text-lg font-bold text-green-900">{formatarTaxa(ensaio.taxa_agregado)}</p>
      </div>
    </div>
  );
}