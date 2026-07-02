import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClimaSection({ periodos, onChange }) {
  const updatePeriodo = (index, patch) => {
    const newPeriodos = [...periodos];
    newPeriodos[index] = { ...newPeriodos[index], ...patch };
    onChange(newPeriodos);
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle className="text-lg">Condições Climáticas</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periodos.map((periodo, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">{periodo.periodo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm">Temperatura (°C)</Label>
                  <Input
                    type="number" step="0.1"
                    value={periodo.temperatura_ambiente}
                    onChange={(e) => updatePeriodo(index, { temperatura_ambiente: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Condições</Label>
                  <Select
                    value={periodo.condicoes_climaticas}
                    onValueChange={(v) => updatePeriodo(index, { condicoes_climaticas: v })}
                  >
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