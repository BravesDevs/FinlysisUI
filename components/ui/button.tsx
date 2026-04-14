import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — layout, transition, accessibility
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:border-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary CTA — azure-to-deep gradient per design spec
        default:
          "bg-gradient-to-br from-[#3ab4e8] to-[#1a6fa3] text-white font-medium hover:brightness-110 active:scale-[0.98]",
        outline:
          "border-[color:var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] font-medium",
        secondary:
          "bg-[var(--color-ice)] text-[var(--color-deep)] hover:bg-[var(--color-sky)] font-medium",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] font-medium",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 font-medium",
        link: "text-[var(--color-azure)] underline-offset-4 hover:underline font-medium",
      },
      size: {
        // Primary size — 10px 24px per spec
        default: "h-auto gap-1.5 py-[10px] px-6 text-[14px] font-[500]",
        xs:      "h-auto gap-1 rounded-[8px] py-1.5 px-3 text-xs font-[500]",
        sm:      "h-auto gap-1 rounded-[8px] py-2 px-4 text-[13px] font-[500]",
        lg:      "h-auto gap-1.5 py-3 px-8 text-[15px] font-[500]",
        icon:    "size-[42px]",
        "icon-xs":"size-7 rounded-[8px]",
        "icon-sm":"size-8 rounded-[8px]",
        "icon-lg":"size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
