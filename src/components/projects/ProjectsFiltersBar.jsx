import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function ProjectsFiltersBar({
  searchTerm,
  onSearchChange,
  tipoFilter,
  onTipoChange,
}) {
  return (
    <Card className="mb-6 bg-card/20 backdrop-blur-lg border border-white/20">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-secondary" />
            <Input
              placeholder="Pesquisar projetos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-transparent border-white/20 placeholder:text-foreground/60 focus:border-secondary/30 focus:ring-[#BFCF99] text-foreground"
            />
          </div>
          <Select value={tipoFilter} onValueChange={onTipoChange}>
            <SelectTrigger className="md:w-56 border-white/20 bg-card/30 text-foreground">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent title="Filtrar por tipo">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="CAUQ">CAUQ</SelectItem>
              <SelectItem value="MRAF">MRAF</SelectItem>
              <SelectItem value="BGS">BGS</SelectItem>
              <SelectItem value="CARTA_TRACO_CONCRETO">Carta Traço Concreto</SelectItem>
              <SelectItem value="CAMADAS_GRANULARES">Camadas Granulares</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}