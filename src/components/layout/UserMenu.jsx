import { useNavigate } from "react-router-dom";
import { Settings, LogOut, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useCallback } from "react";
import { User } from "@/entities/User";

export default function UserMenu({ user, isAdmin, isSalaTecnica, isGestorContrato, isCliente }) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await User.logout();
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    await User.logout();
  }, []);

  const roleLabel = isAdmin ? "Admin"
    : isSalaTecnica ? "Sala Técnica"
    : isGestorContrato ? "Gestor"
    : isCliente ? "Cliente"
    : "Colaborador";

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3 hover:bg-black/5">
            <div className="w-8 h-8 bg-[#00233B] rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[#BFCF99]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[#00233B] text-sm truncate">{user.laboratorista_name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#00233B]/70 truncate">{user.email}</p>
                <Badge variant="secondary" className="text-xs bg-black/10 text-[#00233B]">
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-[#F2F1EF]/80 backdrop-blur-lg border-white/20 text-[#00233B]">
          <DropdownMenuItem onClick={() => navigate("/Settings")} className="cursor-pointer focus:bg-white/10">
            <Settings className="w-4 h-4 mr-2 text-[#BFCF99]" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-500 cursor-pointer focus:bg-white/10 focus:text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Conta
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:bg-white/10 focus:text-red-500">
            <LogOut className="w-4 h-4 mr-2" />
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}