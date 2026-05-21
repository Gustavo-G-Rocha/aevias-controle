import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CargaConcretoCard from "./CargaConcretoCard";

export default function CargasSection({
  cargas, selectedProject, setFormData,
  adicionarCarga, removerCarga, handleCargaChange, handleCPConfigChange,
  getQuantidadeCPs, getTipoRupturaCPs,
}) {
  const handleMoldadoChange = (index, checked) => {
    handleCargaChange(index, "moldado_fiscalizacao", checked);
    if (!checked) {
      setFormData(prev => {
        const newCargas = [...prev.cargas_concreto];
        newCargas[index] = { ...newCargas[index], corpos_prova: [] };
        return { ...prev, cargas_concreto: newCargas };
      });
    }
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Cargas de Concreto</CardTitle>
          {cargas.length < 10 && (
            <Button type="button" onClick={adicionarCarga} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Carga
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cargas.map((carga, index) => (
          <CargaConcretoCard
            key={index}
            carga={carga}
            index={index}
            canRemove={cargas.length > 1}
            selectedProject={selectedProject}
            onRemove={() => removerCarga(index)}
            onCargaChange={handleCargaChange}
            onCPConfigChange={handleCPConfigChange}
            onMoldadoChange={handleMoldadoChange}
            getQuantidadeCPs={getQuantidadeCPs}
            getTipoRupturaCPs={getTipoRupturaCPs}
          />
        ))}
      </CardContent>
    </Card>
  );
}