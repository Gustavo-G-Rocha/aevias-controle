import { Link, useLocation } from "react-router-dom";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, BarChart3, ArrowLeftRight, AlertTriangle, Tags } from "lucide-react";
import { createPageUrl } from "@/utils";
import { ACCESS_LEVELS } from "@/lib/layoutConstants";
import { MAIN_NAVIGATION, ADMIN_NAVIGATION } from "./NavigationConfig";

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wider px-3 pt-4 pb-1" style={{ color: 'var(--color-sidebar-text-muted)' }}>
    {children}
  </p>
);

const NavRow = ({ to, icon: Icon, label, badge, isActive, onNavigate }) => (
  <Link
    to={to}
    onClick={onNavigate}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5"
    style={{
      backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
      color: isActive ? 'var(--color-secondary)' : 'var(--color-sidebar-text)',
    }}>
    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? 'var(--color-secondary)' : 'var(--color-sidebar-text-muted)' }} />
    <span className="font-semibold text-xs">{label}</span>
    {badge > 0 && <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</Badge>}
  </Link>
);

export default function MobileNavSheet({ open, onOpenChange, userAccessLevel, canManageSystem, pendingTransfers }) {
  const location = useLocation();
  const isActive = (url) => location.pathname === url || (url === '/Dashboard' && location.pathname === '/');
  const close = () => onOpenChange(false);

  const isAdmin = userAccessLevel === ACCESS_LEVELS.ADMIN;
  const isSalaTecnica = userAccessLevel === ACCESS_LEVELS.SALA_TECNICA;
  const isGestorContrato = userAccessLevel === ACCESS_LEVELS.GESTOR_CONTRATO;
  const showBadge = pendingTransfers > 0 && (isGestorContrato || isSalaTecnica);

  const showNaoConformidades = [ACCESS_LEVELS.ADMIN, ACCESS_LEVELS.GESTOR_CONTRATO, ACCESS_LEVELS.SALA_TECNICA, ACCESS_LEVELS.CLIENTE, ACCESS_LEVELS.CLIENTE_SUPERVISOR].includes(userAccessLevel);
  const mainNav = MAIN_NAVIGATION.filter((i) => !i.allowedLevels || i.allowedLevels.includes(userAccessLevel));
  const gestaoNav = ADMIN_NAVIGATION.filter((i) => !i.allowedLevels || i.allowedLevels.includes(userAccessLevel));

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[85vh] border-0 rounded-t-[20px]"
        style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
        <DrawerTitle className="sr-only">Menu</DrawerTitle>
        <div className="overflow-y-auto px-3 pb-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
          <SectionLabel>Principal</SectionLabel>
          {mainNav.map((item) => (
            <NavRow key={item.title} to={item.url} icon={item.icon} label={item.title}
              badge={item.showBadge && showBadge ? pendingTransfers : 0}
              isActive={isActive(item.url)} onNavigate={close} />
          ))}

          <SectionLabel>Minhas Obras</SectionLabel>
          <NavRow to={createPageUrl("Projects")} icon={FolderOpen} label="Projetos" isActive={isActive(createPageUrl("Projects"))} onNavigate={close} />
          <NavRow to={createPageUrl("MeusEnsaios")} icon={FileText} label="Ensaios Realizados" isActive={isActive(createPageUrl("MeusEnsaios"))} onNavigate={close} />
          <NavRow to={createPageUrl("ResumosPersonalizados")} icon={BarChart3} label="Resumos" isActive={isActive(createPageUrl("ResumosPersonalizados"))} onNavigate={close} />
          <NavRow to={createPageUrl("SolicitacoesTransferencia")} icon={ArrowLeftRight} label="Transferências"
            badge={showBadge ? pendingTransfers : 0}
            isActive={isActive(createPageUrl("SolicitacoesTransferencia"))} onNavigate={close} />
          {(isGestorContrato || isAdmin) &&
            <NavRow to="/ImpressionEtiquetas" icon={Tags} label="Impressão de Etiquetas" isActive={isActive("/ImpressionEtiquetas")} onNavigate={close} />}
          {(isGestorContrato || isSalaTecnica || isAdmin) &&
            <NavRow to="/RelatoriosUnificados" icon={FileText} label="Relatório Consolidado Regional" isActive={isActive("/RelatoriosUnificados")} onNavigate={close} />}

          {showNaoConformidades && (
            <>
              <SectionLabel>Não Conformidades</SectionLabel>
              <NavRow to={createPageUrl("NaoConformidades")} icon={BarChart3} label="Dashboard de NCs" isActive={isActive(createPageUrl("NaoConformidades"))} onNavigate={close} />
              <NavRow to={createPageUrl("GestaoNC")} icon={FileText} label="Gestão de NCs" isActive={isActive(createPageUrl("GestaoNC"))} onNavigate={close} />
              {(isGestorContrato || isAdmin) &&
                <NavRow to={createPageUrl("NovaNC")} icon={AlertTriangle} label="Nova NC" isActive={isActive(createPageUrl("NovaNC"))} onNavigate={close} />}
            </>
          )}

          {gestaoNav.length > 0 && (
            <>
              <SectionLabel>{canManageSystem ? "Administração" : "Gestão"}</SectionLabel>
              {gestaoNav.map((item) => (
                <NavRow key={item.title} to={item.url} icon={item.icon} label={item.title} isActive={isActive(item.url)} onNavigate={close} />
              ))}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}