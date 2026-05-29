import { useNavigate } from "react-router-dom";
import { Settings, LogOut, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function UserMenu({ user, isAdmin, isSalaTecnica, isGestorContrato, isCliente }) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    base44.auth.logout();
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    base44.auth.logout();
  }, []);

  const roleLabel = isAdmin ? "Admin" :
  isSalaTecnica ? "Sala Técnica" :
  isGestorContrato ? "Gestor" :
  isCliente ? "Cliente" :
  "Colaborador";

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3 rounded-xl sidebar-user-btn">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(191,207,153,0.2)' }}>
              <UserIcon className="w-4 h-4" style={{ color: 'var(--color-sidebar-icon)' }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium truncate text-xs" style={{ color: 'var(--color-sidebar-text)' }}>{user.full_name || user.laboratorista_name || user.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs truncate" style={{ color: 'var(--color-sidebar-text-muted)' }}>{user.email}</p>
                <Badge variant="secondary" className="text-xs flex-shrink-0" style={{ backgroundColor: 'rgba(191,207,153,0.2)', color: 'var(--color-secondary)', border: 'none' }}>
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 shadow-xl border sidebar-dropdown-content">
          <DropdownMenuItem onClick={() => navigate("/Settings")} className="cursor-pointer gap-2">
            <Settings className="w-4 h-4 flex-shrink-0" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive">
            
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            Excluir Conta
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Sua conta e todos os seus dados serão permanentemente removidos do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);

}