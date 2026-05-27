import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ProjectsFiltersBar({
  searchTerm,
  onSearchChange,
  tipoFilter,
  onTipoChange,
}) {
  return (
    <Card className="mb-6 bg-white/20 backdrop-blur-lg border border-white/20">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#BFCF99]" />
            <Input
              placeholder="Pesquisar projetos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-transparent border-white/20 placeholder:text-[#00233B]/60 focus:border-[#BFCF99] focus:ring-[#BFCF99] text-[#00233B]"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => onTipoChange(e.target.value)}
            className="h-10 rounded-md border border-white/20 bg-white/30 px-3 py-2 text-sm text-[#00233B] focus:outline-none focus:ring-1 focus:ring-[#BFCF99]"
          >
            <option value="all">Todos os tipos</option>
            <option value="CAUQ">CAUQ</option>
            <option value="MRAF">MRAF</option>
            <option value="BGS">BGS</option>
            <option value="CARTA_TRACO_CONCRETO">Carta Traço Concreto</option>
            <option value="CAMADAS_GRANULARES">Camadas Granulares</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}