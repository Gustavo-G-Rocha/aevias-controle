"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import * as Desktop from "@/components/ui/desktop-select"

const MobileSelectContext = React.createContext(null)

// Bottom sheet (vaul) em viewports < 1024px — alinhado ao breakpoint `lg`
// usado pelo restante do layout mobile (BottomNav, MobileBackHeader, cards) —
// e também em dispositivos de toque (pointer coarse, sem hover), independente
// da largura da tela. Estado inicial síncrono para evitar "flip" pós-mount.
const MOBILE_QUERY = "(max-width: 1023px), ((hover: none) and (pointer: coarse))"

function useIsMobileViewport() {
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  )
  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setMobile(mql.matches)
    mql.addEventListener("change", onChange)
    setMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return mobile
}

function collectItems(children, result = []) {
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return
    if (child.type?.mobileSelectItem) result.push({ value: child.props.value, label: child.props.children, disabled: child.props.disabled })
    else if (child.props?.children) collectItems(child.props.children, result)
  })
  return result
}

function Select({ value, onValueChange, disabled, children, ...props }) {
  const mobile = useIsMobileViewport()
  const [open, setOpen] = React.useState(false)
  const [hasOpened, setHasOpened] = React.useState(false)
  const items = React.useMemo(() => collectItems(children), [children])
  if (!mobile) return <Desktop.Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>{children}</Desktop.Select>
  const handleOpenChange = (next) => {
    setOpen(next)
    if (next) setHasOpened(true)
  }
  return <MobileSelectContext.Provider value={{ value, onValueChange, disabled, items, open, hasOpened }}><Drawer open={open} onOpenChange={handleOpenChange}>{children}</Drawer></MobileSelectContext.Provider>
}

function SelectTrigger({ className, children, ...props }) {
  // A decisão mobile/desktop vem do PAI (contexto), nunca de um hook próprio:
  // garante que o trigger sempre combine com o modo em que o Select renderizou.
  const context = React.useContext(MobileSelectContext)
  if (!context) return <Desktop.SelectTrigger className={className} {...props}>{children}</Desktop.SelectTrigger>
  return <DrawerTrigger asChild disabled={context?.disabled}><button type="button" className={cn("flex min-h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}<ChevronDown className="h-4 w-4 opacity-50" /></button></DrawerTrigger>
}

function SelectValue({ placeholder = "Selecione" }) {
  const context = React.useContext(MobileSelectContext)
  if (!context) return <Desktop.SelectValue placeholder={placeholder} />
  const selected = context?.items.find(item => item.value === context.value)
  return <span className={cn("line-clamp-1", !selected && "text-muted-foreground")}>{selected?.label || placeholder}</span>
}

function SelectContent({ children, className, title = "Selecione uma opção", ...props }) {
  const context = React.useContext(MobileSelectContext)
  if (!context) return <Desktop.SelectContent className={className} {...props}>{children}</Desktop.SelectContent>
  // Lazily mount the DrawerContent portal only after the first open.
  // Without this, every closed Select on a page mounts a portal div in
  // document.body on initial render. During framer-motion page transitions
  // (key={pathname}), multiple portals mounting/unmounting simultaneously
  // cause "removeChild" DOM exceptions. Deferring until first open avoids
  // the conflict while preserving the open/close animation afterward.
  if (!context.hasOpened) return null
  return <DrawerContent className="max-h-[75vh] pb-[env(safe-area-inset-bottom)]"><DrawerHeader><DrawerTitle>{title}</DrawerTitle></DrawerHeader><div className={cn("overflow-y-auto px-3 pb-4", className)}>{children}</div></DrawerContent>
}

function SelectItem({ value, children, disabled, className, ...props }) {
  const context = React.useContext(MobileSelectContext)
  if (!context) return <Desktop.SelectItem value={value} disabled={disabled} className={className} {...props}>{children}</Desktop.SelectItem>
  const selected = context?.value === value
  return <DrawerClose asChild><button type="button" disabled={disabled} onClick={() => context?.onValueChange?.(value)} className={cn("flex min-h-12 w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm hover:bg-accent disabled:opacity-50", selected && "bg-accent font-medium", className)} {...props}><span>{children}</span>{selected && <Check className="h-5 w-5" />}</button></DrawerClose>
}
SelectItem.mobileSelectItem = true

function SelectGroup({ children }) { const context = React.useContext(MobileSelectContext); return context ? <div>{children}</div> : <Desktop.SelectGroup>{children}</Desktop.SelectGroup> }
function SelectLabel(props) { const context = React.useContext(MobileSelectContext); return context ? <div className={cn("px-3 py-2 text-sm font-semibold", props.className)}>{props.children}</div> : <Desktop.SelectLabel {...props} /> }
function SelectSeparator(props) { const context = React.useContext(MobileSelectContext); return context ? <div className={cn("my-1 h-px bg-muted", props.className)} /> : <Desktop.SelectSeparator {...props} /> }
const SelectScrollUpButton = Desktop.SelectScrollUpButton
const SelectScrollDownButton = Desktop.SelectScrollDownButton

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton }