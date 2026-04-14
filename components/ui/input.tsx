import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & shape
        "w-full min-w-0 rounded-[10px] px-3 py-[10px] h-auto",
        // Typography — Inter per spec (UI fields never Bodoni)
        "text-[14px] font-normal leading-snug text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)] placeholder:font-normal",
        // Surface
        "bg-[var(--bg-card)] border border-[color:var(--border)]",
        // Focus — azure ring per spec
        "outline-none transition-[border-color,box-shadow]",
        "focus-visible:border-[color:var(--color-azure)]",
        "focus-visible:shadow-[0_0_0_3px_rgba(58,180,232,0.20)]",
        // States
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
        // File input
        "file:inline-flex file:h-auto file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
