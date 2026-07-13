import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export default function SidebarToggle() {
  const { open, toggleSidebar, isMobile } = useSidebar();

  if (isMobile) return null;

  return (
    <button
      onClick={toggleSidebar}
      aria-label={open ? "Recolher menu" : "Expandir menu"}
      title={open ? "Recolher menu" : "Expandir menu"}
      className="hidden md:flex fixed top-4 z-30 items-center justify-center w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer"
      style={{
        left: open ? "calc(16rem - 14px)" : "6px",
        transition: "left 200ms ease-linear",
      }}
    >
      {open ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
    </button>
  );
}