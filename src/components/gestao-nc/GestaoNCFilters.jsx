import React from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GestaoNCFilters({
  filtroTexto,
  setFiltroTexto,
  filtroObra,
  setFiltroObra,
  filtroStatus,
  setFiltroStatus,
  obras,
}) {
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00233B]/50" />
            <Input
              placeholder="Buscar por RNC, rodovia, trecho..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-9 bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
          <select
            value={filtroObra}
            onChange={(e) => setFiltroObra(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
          >
            <option value="">Todas as Obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
          >
            <option value="">Todos os Status</option>
            <option value="aberta">Aberta</option>
            <option value="em_tratativa">Em Tratativa</option>
            <option value="encerrada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}