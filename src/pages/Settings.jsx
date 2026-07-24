import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSelector from "@/components/settings/ThemeSelector";
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
import * as usersService from "@/services/usuariosService";
import { toast } from "@/components/ui/use-toast";

export default function Settings() {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await usersService.deletarUsuario();
      await base44.auth.logout();
    } catch (error) {
      toast({
        title: "Erro ao excluir conta",
        description: error?.response?.data?.error || error.message,
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Configurações</h1>
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>Personalize a aparência do aplicativo</p>
      </div>

      <Card className="backdrop-blur-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Sun className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
            Tema
          </CardTitle>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Escolha entre o tema claro e escuro.</p>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-danger)', color: 'var(--color-text)' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ações irreversíveis para a sua conta</p>
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