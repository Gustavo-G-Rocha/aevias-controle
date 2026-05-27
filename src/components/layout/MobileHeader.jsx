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
      className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-sm flex items-center justify-between px-4"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderBottom: '1px solid var(--color-sidebar-border)' }}
      style={{ paddingTop: "env(safe-area-inset-top)", minHeight: "calc(3rem + env(safe-area-inset-top))" }}
    >
      {location.pathname !== "/" && (
        <button
          type="button"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          className="flex items-center gap-1 font-medium select-none py-2 pr-6 pl-1 min-h-[44px] min-w-[80px] active:opacity-70"
          style={{ color: 'var(--color-sidebar-text)' }}
        >
          <div className="flex items-center gap-2 py-3">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'rgba(191,207,153,0.15)' }}>
                    <UserIcon className="w-4 h-4" style={{ color: 'var(--color-sidebar-icon)' }} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 border-0 shadow-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-sidebar-text)' }}>
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-sidebar-text)' }}>{user.email}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--color-sidebar-text-muted)' }}>{user.laboratorista_name || user.full_name}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/Settings")} className="cursor-pointer focus:bg-white/10">
                    <Settings className="w-4 h-4 mr-2" style={{ color: 'var(--color-secondary)' }} />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:bg-white/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <span className="text-base font-bold" style={{ color: 'var(--color-sidebar-text)' }}>Afirmaevias</span>
          </div>
        </button>
      )}

      <div className="flex items-center gap-2">
        {canCreateRecords && (
          <DialogTrigger asChild>
            <Button size="icon" className="shadow-lg transition-opacity h-11 w-11 active:scale-95" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
              <FilePlus className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </Button>
          </DialogTrigger>
        )}
      </div>
    </div>
  );
}