import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function EditRegistroDialog({ open, registro, empreiteiras, usinas, onSave, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Empreiteira ou Usina</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Empreiteira Atendida</Label>
            <Select
              value={registro?.empreiteira || ""}
              onValueChange={(value) => onSave(value, 'empreiteira')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empreiteira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhuma</SelectItem>
                {empreiteiras.map(emp => (
                  <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center text-sm text-gray-500">
            <span className="px-2">ou</span>
          </div>

          <div>
            <Label>Usina</Label>
            <Select
              value={registro?.usina || ""}
              onValueChange={(value) => onSave(value, 'usina')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a usina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhuma</SelectItem>
                {usinas.map(usina => (
                  <SelectItem key={usina} value={usina}>{usina}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MarcaDiaDialog({ open, dia, onSave, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar Dia {dia}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Nenhum registro encontrado para este dia. Marque como:
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              variant="secondary"
              onClick={() => onSave('N/A')}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              N/A
            </Button>
            <Button
              onClick={() => onSave('OK')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}