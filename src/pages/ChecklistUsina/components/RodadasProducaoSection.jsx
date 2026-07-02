import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function RodadasProducaoSection({
  rodadas,
  isEditable,
  isApproved,
  onRodadaChange,
  onAdicionarRodada,
  onRemoverRodada,
}) {
  const canEdit = isEditable && !isApproved;

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Acompanhamento da Produção</CardTitle>
          {canEdit && rodadas.length < 4 && (
            <Button type="button" onClick={onAdicionarRodada}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Rodada
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rodadas.map((rodada, index) => (
          <Card key={`rodada-${index}`} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Rodada {rodada.numero_rodada}</CardTitle>
                {canEdit && rodadas.length > 1 && (
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => onRemoverRodada(index)}
                    className="text-red-500 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Horário Início</Label>
                <Input type="time" value={rodada.horario_inicio}
                  onChange={(e) => onRodadaChange(index, 'horario_inicio', e.target.value)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Horário Término</Label>
                <Input type="time" value={rodada.horario_termino}
                  onChange={(e) => onRodadaChange(index, 'horario_termino', e.target.value)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Temperatura Ambiente (°C)</Label>
                <Input type="number" value={rodada.temperatura_ambiente || ''}
                  onChange={(e) => onRodadaChange(index, 'temperatura_ambiente', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Condições Climáticas</Label>
                <Select value={rodada.condicoes_climaticas}
                  onValueChange={(v) => onRodadaChange(index, 'condicoes_climaticas', v)}
                  disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="instavel">Instável</SelectItem>
                    <SelectItem value="chuva">Chuva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade Produzida (t)</Label>
                <Input type="number" min="0" step="0.01" value={rodada.quantidade_produzida || ''}
                  onChange={(e) => onRodadaChange(index, 'quantidade_produzida', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Controle de Cargas (Qtde)</Label>
                <Input type="number" min="0" value={rodada.controle_cargas_qtde || ''}
                  onChange={(e) => onRodadaChange(index, 'controle_cargas_qtde', e.target.value ? parseInt(e.target.value) : 0)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Temperatura Massa T1 (°C)</Label>
                <Input type="number" value={rodada.temperatura_massa_t1 || ''}
                  onChange={(e) => onRodadaChange(index, 'temperatura_massa_t1', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} />
              </div>
              <div>
                <Label>Temperatura Massa T2 (°C)</Label>
                <Input type="number" value={rodada.temperatura_massa_t2 || ''}
                  onChange={(e) => onRodadaChange(index, 'temperatura_massa_t2', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!canEdit} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id={`enlonados-${index}`}
                  checked={rodada.caminhoes_enlonados}
                  onChange={(e) => onRodadaChange(index, 'caminhoes_enlonados', e.target.checked)}
                  disabled={!canEdit} className="w-4 h-4" />
                <Label htmlFor={`enlonados-${index}`} className="text-sm">Caminhões Enlonados</Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}