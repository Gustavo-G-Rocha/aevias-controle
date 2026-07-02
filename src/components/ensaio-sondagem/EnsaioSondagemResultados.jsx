import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

function CorpoProvaCard({ cp, index, metodo, onUpdate, onRemove }) {
  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Corpo de Prova #{cp.numero}</CardTitle>
        <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(index)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Data Execução</Label>
            <Input type="date" value={cp.data_execucao} onChange={e => onUpdate(index, 'data_execucao', e.target.value)} />
          </div>
          <div>
            <Label>Estaca</Label>
            <Input value={cp.estaca} onChange={e => onUpdate(index, 'estaca', e.target.value)} placeholder="Ex: km 10+500" />
          </div>
          <div>
            <Label>Lado</Label>
            <select value={cp.lado} onChange={e => onUpdate(index, 'lado', e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="direito">Direito</option>
              <option value="esquerdo">Esquerdo</option>
            </select>
          </div>
          <div>
            <Label>Média Espessura (cm)</Label>
            <Input type="number" step="0.01" value={cp.media_espessura} readOnly className="bg-gray-100" />
          </div>
        </div>

        <div>
          <Label>Medidas de Espessura (cm)</Label>
          <div className="grid grid-cols-4 gap-2">
            {cp.medidas_espessura.map((medida, mIndex) => (
              <Input
                key={mIndex}
                type="number"
                step="0.01"
                value={medida}
                onChange={e => {
                  const newMedidas = [...cp.medidas_espessura];
                  newMedidas[mIndex] = e.target.value;
                  onUpdate(index, 'medidas_espessura', newMedidas);
                }}
                placeholder={`M${mIndex + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Peso ao Ar (g)</Label>
            <Input type="number" step="0.01" value={cp.peso_ao_ar}
              onChange={e => onUpdate(index, 'peso_ao_ar', e.target.value)} />
          </div>
          <div>
            <Label>Peso Imerso (g)</Label>
            <Input type="number" step="0.01" value={cp.peso_imerso}
              onChange={e => onUpdate(index, 'peso_imerso', e.target.value)} />
          </div>
          {metodo === "DNIT 428/2022" && (
            <div>
              <Label>Peso Saturado (g)</Label>
              <Input type="number" step="0.01" value={cp.peso_saturado}
                onChange={e => onUpdate(index, 'peso_saturado', e.target.value)} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Volume (cm³) - Calculado</Label>
            <Input type="number" step="0.01" value={cp.volume} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>Densidade (g/cm³) - Calculado</Label>
            <Input type="number" step="0.0001" value={cp.densidade} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>G.C. Dens. Projeto (%) - Calculado</Label>
            <Input type="number" step="0.01" value={cp.gc_dens_projeto} readOnly className="bg-gray-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Dens. RICE do Dia (g/cm³)</Label>
            <Input type="number" step="0.0001" value={cp.dens_rice_do_dia}
              onChange={e => onUpdate(index, 'dens_rice_do_dia', e.target.value)} />
          </div>
          <div>
            <Label>G.C. Dens. RICE (%) - Calculado</Label>
            <Input type="number" step="0.01" value={cp.gc_dens_rice_dia} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>Volume Vazios (%) - Calculado</Label>
            <Input type="number" step="0.01" value={cp.volume_vazios} readOnly className="bg-gray-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Leitura (Kgf/cm²)</Label>
            <Input type="number" step="0.01" value={cp.leitura}
              onChange={e => onUpdate(index, 'leitura', e.target.value)} />
          </div>
          <div>
            <Label>RTCD 25°C (MPa) - Calculado</Label>
            <Input type="number" step="0.01" value={cp.rtcd_25c} readOnly className="bg-gray-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnsaioSondagemResultados({ formData, addCorpoProva, removeCorpoProva, updateCorpoProva }) {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle className="text-lg">Corpos de Prova</CardTitle>
        <CardDescription>Adicione até 10 corpos de prova</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.corpos_prova.map((cp, index) => (
          <CorpoProvaCard
            key={`cp-${index}`}
            cp={cp}
            index={index}
            metodo={formData.metodo_ensaio}
            onUpdate={updateCorpoProva}
            onRemove={removeCorpoProva}
          />
        ))}

        {formData.corpos_prova.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>Nenhum corpo de prova adicionado.</p>
            <p className="text-sm">Clique em "Adicionar CP" abaixo para começar.</p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={addCorpoProva}
            disabled={formData.corpos_prova.length >= 10}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar CP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}