/**
 * ClimaSection.jsx — ChecklistAplicacao
 *
 * Seção de condições climáticas por período (manhã, tarde, noite).
 * Exibe cards com temperatura e condições para cada período.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PERIODO_LABEL = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

export default function ClimaSection({ periodos, isEditable, onChange }) {
  const handlePeriodoChange = (index, field, value) => {
    const newPeriodos = [...periodos];
    newPeriodos[index] = { ...newPeriodos[index], [field]: value };
    onChange(newPeriodos);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#00233B] mb-4">Condições Climáticas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {periodos.map((periodo, index) => (
          <Card key={periodo.periodo} className="bg-black/5 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#00233B]">
                {PERIODO_LABEL[periodo.periodo] || periodo.periodo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Temperatura (°C)</Label>
                <Input type="number" step="0.1"
                  value={periodo.temperatura_ambiente || ''}
                  onChange={(e) => handlePeriodoChange(index, 'temperatura_ambiente', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={!isEditable} placeholder="Ex: 25.5" />
              </div>
              <div>
                <Label>Condições</Label>
                <Select value={periodo.condicoes_climaticas}
                  onValueChange={(v) => handlePeriodoChange(index, 'condicoes_climaticas', v)}
                  disabled={!isEditable}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="instavel">Instável</SelectItem>
                    <SelectItem value="chuva">Chuva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}