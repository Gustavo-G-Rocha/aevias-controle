import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClimaSection({ periodos, onChange, isEditable, isApproved }) {
  const updatePeriodo = (index, patch) => {
    const novos = [...periodos];
    novos[index] = { ...novos[index], ...patch };
    onChange(novos);
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-4"><CardTitle className="text-xl">Condições Climáticas</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {periodos.map((periodo, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-base font-semibold text-foreground mb-3 capitalize">
                {periodo.periodo === 'manha' ? 'Manhã' : 'Tarde'}
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-foreground">Temperatura Ambiente (°C)</Label>
                  <Input type="number" value={periodo.temperatura_ambiente || ''}
                    onChange={(e) => updatePeriodo(index, { temperatura_ambiente: e.target.value ? parseFloat(e.target.value) : null })}
                    disabled={!isEditable || isApproved} className="h-10 text-base" />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Condições Climáticas</Label>
                  <Select value={periodo.condicoes_climaticas}
                    onValueChange={(v) => updatePeriodo(index, { condicoes_climaticas: v })}
                    disabled={!isEditable || isApproved}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bom">☀️ Bom</SelectItem>
                      <SelectItem value="nublado">⛅ Nublado</SelectItem>
                      <SelectItem value="chuva">🌧️ Chuva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}