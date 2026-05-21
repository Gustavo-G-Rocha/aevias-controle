import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PERIODO_LABEL = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

export default function ClimaSection({ periodos, onChange, isEditable }) {
  const update = (index, patch) => {
    const novos = [...periodos];
    novos[index] = { ...novos[index], ...patch };
    onChange(novos);
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-lg">Condições Climáticas</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {periodos.map((periodo, index) => (
            <Card key={`clima-${index}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{PERIODO_LABEL[periodo.periodo] || periodo.periodo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm">Temperatura (°C) *</Label>
                  <Input type="number" step="0.1" value={periodo.temperatura_ambiente} disabled={!isEditable}
                    onChange={(e) => update(index, { temperatura_ambiente: e.target.value })} required />
                </div>
                <div>
                  <Label className="text-sm">Condições *</Label>
                  <Select value={periodo.condicoes_climaticas} disabled={!isEditable}
                    onValueChange={(v) => update(index, { condicoes_climaticas: v })}>
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
      </CardContent>
    </Card>
  );
}