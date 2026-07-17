import React from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Card className="bg-transparent">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por RNC, rodovia, trecho..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filtroObra || "__all__"}
            onValueChange={(value) => setFiltroObra(value === "__all__" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as Obras" />
            </SelectTrigger>
            <SelectContent title="Filtrar por obra">
              <SelectItem value="__all__">Todas as Obras</SelectItem>
              {obras.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filtroStatus || "__all__"}
            onValueChange={(value) => setFiltroStatus(value === "__all__" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent title="Filtrar por status">
              <SelectItem value="__all__">Todos os Status</SelectItem>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="em_tratativa">Em Tratativa</SelectItem>
              <SelectItem value="encerrada">Finalizada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}