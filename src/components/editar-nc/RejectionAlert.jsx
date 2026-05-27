import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function RejectionAlert({ motivo }) {
  if (!motivo) return null;

  return (
    <Card className="bg-red-50/50 backdrop-blur-lg border-2 border-red-300">
      <CardContent className="pt-4">
        <p className="font-semibold text-red-800 mb-2">
          Motivo da Reprovação pelo Cliente:
        </p>
        <p className="text-red-700">{motivo}</p>
      </CardContent>
    </Card>
  );
}