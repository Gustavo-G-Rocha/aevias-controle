import { useNavigate, useLocation } from "react-router-dom";
import { FilePlus, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/entities/User";
import { useCallback } from "react";

export default function MobileHeader({ user, canCreateRecords }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(async () => {
    await User.logout();
  }, []);

  return (
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#F2F1EF]/95 backdrop-blur-md border-b border-black/10 flex items-center justify-between px-4"
      style={{ paddingTop: "env(safe-area-inset-top)", minHeight: "calc(3rem + env(safe-area-inset-top))" }}
    >
      {location.pathname !== "/" && (
        <button
          type="button"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          className="flex items-center gap-1 text-[#00233B] font-medium select-none py-2 pr-6 pl-1 min-h-[44px] min-w-[80px] active:opacity-70"
        >
          <div className="flex items-center gap-2 py-3">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-[#00233B]/10 hover:bg-[#00233B]/20">
                    <UserIcon className="w-4 h-4 text-[#00233B]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-[#F2F1EF]/95 backdrop-blur-lg border-white/20 text-[#00233B]">
                  <div className="px-3 py-2 border-b border-black/10">
                    <p className="text-xs font-medium text-[#00233B] truncate">{user.email}</p>
                    <p className="text-[10px] text-[#00233B]/60 truncate">{user.laboratorista_name || user.full_name}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/Settings")} className="cursor-pointer focus:bg-white/10">
                    <Settings className="w-4 h-4 mr-2 text-[#BFCF99]" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:bg-white/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <span className="text-base font-bold text-[#00233B]">Afirmaevias</span>
          </div>
        </button>
      )}

      <div className="flex items-center gap-2">
        {canCreateRecords && (
          <DialogTrigger asChild>
            <Button size="icon" className="bg-[#00233B] text-[#F2F1EF] shadow-lg ring-2 ring-white/20 hover:bg-[#00233B]/90 transition-colors h-11 w-11 active:scale-95">
              <FilePlus className="w-5 h-5 text-[#BFCF99]" />
            </Button>
          </DialogTrigger>
        )}
      </div>
    </div>
  );
}