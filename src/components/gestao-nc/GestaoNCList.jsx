import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import GestaoNCCard from "./GestaoNCCard";

export default function GestaoNCList({
  filtradas,
  obras,
  user,
  onUpdateStatus,
  onApproval,
  onSolicitarAprovacao,
}) {
  if (filtradas.length === 0) {
    return (
      <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="w-14 h-14 text-foreground/30 mb-4" />
          <p className="text-foreground/60 text-center">
            Nenhuma não conformidade encontrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filtradas.map((nc) => (
        <GestaoNCCard
          key={nc.id}
          nc={nc}
          obras={obras}
          user={user}
          onUpdateStatus={onUpdateStatus}
          onApproval={onApproval}
          onSolicitarAprovacao={onSolicitarAprovacao}
        />
      ))}
    </div>
  );
}