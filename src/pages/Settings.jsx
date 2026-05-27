import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";

export default function Settings() {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.logout();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#00233B]">Configurações</h1>
        <p className="text-[#00233B]/80 mt-1">Personalize a aparência do aplicativo</p>
      </div>

      <Card className="bg-white/20 backdrop-blur-lg border border-white/20 text-[#00233B]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#00233B] flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#BFCF99]" />
            Tema
          </CardTitle>
          <p className="text-sm text-[#00233B]/70">O aplicativo utiliza o tema claro.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#BFCF99] bg-[#BFCF99]/20 w-fit">
            <div className="p-3 rounded-full bg-[#00233B]">
              <Sun className="w-6 h-6 text-[#BFCF99]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#00233B]">Claro</p>
              <p className="text-xs text-[#00233B]/50 mt-0.5">Tema claro ativo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/20 backdrop-blur-lg border border-red-200/30 text-[#00233B]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <p className="text-sm text-[#00233B]/70">Ações irreversíveis para a sua conta</p>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto" disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? 'Processando...' : 'Excluir minha conta'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Sua conta e todos os seus dados serão permanentemente removidos do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sim, excluir minha conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}