import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_LABELS, countNCsByStatus } from "@/utils/gestaoNCUtils";

export default function GestaoNCSummary({ ncs }) {
  const statusList = ["aberta", "em_tratativa", "encerrada", "cancelada"];
  const statusColors = {
    aberta: "text-red-600",
    em_tratativa: "text-yellow-600",
    encerrada: "text-green-600",
    cancelada: "text-gray-500",
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {statusList.map((s) => (
        <Card key={s} className="bg-white/20 backdrop-blur-lg border border-white/20">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-[#00233B]/70 font-medium uppercase tracking-wide">
              {STATUS_LABELS[s]}
            </p>
            <p className={`text-3xl font-bold mt-1 ${statusColors[s]}`}>
              {countNCsByStatus(ncs, s)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}