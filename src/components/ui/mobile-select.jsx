"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import * as Desktop from "@/components/ui/desktop-select"

const MobileSelectContext = React.createContext(null)

function collectItems(children, result = []) {
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return
    if (child.type?.mobileSelectItem) result.push({ value: child.props.value, label: child.props.children, disabled: child.props.disabled })
    else if (child.props?.children) collectItems(child.props.children, result)
  })
  return result
}

function Select({ value, onValueChange, disabled, children, ...props }) {
  const mobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const items = React.useMemo(() => collectItems(children), [children])
  if (!mobile) return <Desktop.Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>{children}</Desktop.Select>
  return <MobileSelectContext.Provider value={{ value, onValueChange, disabled, items }}><Drawer open={open} onOpenChange={setOpen}>{children}</Drawer></MobileSelectContext.Provider>
}

function SelectTrigger({ className, children, ...props }) {
  const mobile = useIsMobile()
  const context = React.useContext(MobileSelectContext)
  if (!mobile) return <Desktop.SelectTrigger className={className} {...props}>{children}</Desktop.SelectTrigger>
  return <DrawerTrigger asChild disabled={context?.disabled}><button type="button" className={cn("flex min-h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}<ChevronDown className="h-4 w-4 opacity-50" /></button></DrawerTrigger>
}

function SelectValue({ placeholder = "Selecione" }) {
  const mobile = useIsMobile()
  const context = React.useContext(MobileSelectContext)
  if (!mobile) return <Desktop.SelectValue placeholder={placeholder} />
  const selected = context?.items.find(item => item.value === context.value)
  return <span className={cn("line-clamp-1", !selected && "text-muted-foreground")}>{selected?.label || placeholder}</span>
}

function SelectContent({ children, className, title = "Selecione uma opção", ...props }) {
  const mobile = useIsMobile()
  if (!mobile) return <Desktop.SelectContent className={className} {...props}>{children}</Desktop.SelectContent>
  return <DrawerContent className="max-h-[75vh] pb-[env(safe-area-inset-bottom)]"><DrawerHeader><DrawerTitle>{title}</DrawerTitle></DrawerHeader><div className={cn("overflow-y-auto px-3 pb-4", className)}>{children}</div></DrawerContent>
}

function SelectItem({ value, children, disabled, className, ...props }) {
  const mobile = useIsMobile()
  const context = React.useContext(MobileSelectContext)
  if (!mobile) return <Desktop.SelectItem value={value} disabled={disabled} className={className} {...props}>{children}</Desktop.SelectItem>
  const selected = context?.value === value
  return <DrawerClose asChild><button type="button" disabled={disabled} onClick={() => context?.onValueChange?.(value)} className={cn("flex min-h-12 w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm hover:bg-accent disabled:opacity-50", selected && "bg-accent font-medium", className)} {...props}><span>{children}</span>{selected && <Check className="h-5 w-5" />}</button></DrawerClose>
}
SelectItem.mobileSelectItem = true

function SelectGroup({ children }) { const mobile = useIsMobile(); return mobile ? <div>{children}</div> : <Desktop.SelectGroup>{children}</Desktop.SelectGroup> }
function SelectLabel(props) { const mobile = useIsMobile(); return mobile ? <div className={cn("px-3 py-2 text-sm font-semibold", props.className)}>{props.children}</div> : <Desktop.SelectLabel {...props} /> }
function SelectSeparator(props) { const mobile = useIsMobile(); return mobile ? <div className={cn("my-1 h-px bg-muted", props.className)} /> : <Desktop.SelectSeparator {...props} /> }
const SelectScrollUpButton = Desktop.SelectScrollUpButton
const SelectScrollDownButton = Desktop.SelectScrollDownButton

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton }