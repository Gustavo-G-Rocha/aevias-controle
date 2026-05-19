import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectFormSpecification({
  formData,
  faixasGranulometricas,
  tipoProjetoAtual,
  onInputChange
}) {
  const faixasFiltradas = faixasGranulometricas.filter(
    f => f.tipo === tipoProjetoAtual && f.status === 'ativo'
  );

  const temFaixa = ['CAUQ', 'MRAF', 'BGS', 'CAMADAS_GRANULARES'].includes(tipoProjetoAtual);

  if (!temFaixa) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especificação Técnica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="faixa_granulometrica_id">Faixa Granulométrica *</Label>
          <Select 
            value={formData.faixa_granulometrica_id} 
            onValueChange={(value) => onInputChange('faixa_granulometrica_id', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a faixa granulométrica" />
            </SelectTrigger>
            <SelectContent>
              {faixasFiltradas.map(faixa => (
                <SelectItem key={faixa.id} value={faixa.id}>
                  <div className="flex items-center gap-2">
                    <span>{faixa.nome}</span>
                    <span className="text-xs text-slate-500">({faixa.especificacao})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {['CAUQ', 'MRAF', 'BGS'].includes(tipoProjetoAtual) && (
          <div>
            <Label htmlFor="equivalente_areia_minimo">Equivalente de Areia Mínimo (%)</Label>
            <Input
              id="equivalente_areia_minimo"
              type="number"
              step="0.1"
              value={formData.equivalente_areia_minimo}
              onChange={(e) => onInputChange('equivalente_areia_minimo', parseFloat(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1">
              Limite mínimo aceitável para ensaios
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}