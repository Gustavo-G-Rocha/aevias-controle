import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SidebarContext } from
"@/components/ui/sidebar/context";

const SidebarProvider = React.forwardRef(function SidebarProvider(
{ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props },
ref)
{
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    function (value) {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(function () {
    return isMobile ? setOpenMobile(function (o) {return !o;}) : setOpen(function (o) {return !o;});
  }, [isMobile, setOpen]);

  React.useEffect(function () {
    const handleKeyDown = function (event) {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return function () {window.removeEventListener("keydown", handleKeyDown);};
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo(
    function () {return { state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar };},
    [state, open, setOpen, isMobile, openMobile, toggleSidebar] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style }}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}>
          
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>);

});
SidebarProvider.displayName = "SidebarProvider";

export { SidebarProvider };