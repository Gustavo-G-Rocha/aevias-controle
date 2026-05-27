import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function GranuMisturaHeader({ editingId, rejectionReason }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Editar Granulometria da Mistura" : "Nova Granulometria da Mistura"}</CardTitle>
        <CardDescription>Ensaio DNIT 412/25 - ME</CardDescription>
        {rejectionReason && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{rejectionReason}</p>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}