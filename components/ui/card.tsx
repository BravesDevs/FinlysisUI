import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        // Shape — 16px radius per spec
        "group/card flex flex-col gap-4 overflow-hidden rounded-[16px]",
        // Surface — white bg, azure tint border, dual shadow per spec
        "bg-[var(--bg-card)] text-[var(--text-primary)]",
        "border border-[color:var(--border)]",
        "shadow-card",
        // Size variants
        "py-4 text-[15px]",
        "data-[size=sm]:gap-3 data-[size=sm]:py-3",
        // Image rounding
        "has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-[16px] *:[img:last-child]:rounded-b-[16px]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // grad-card strip per spec
        "grad-card group/card-header @container/card-header",
        "grid auto-rows-min items-start gap-1 px-5",
        "rounded-t-[16px] pb-4 pt-5",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "group-data-[size=sm]/card:px-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Section heading per spec — Bodoni via font-heading
        "font-heading font-medium leading-snug tracking-[-0.01em] text-[1.125rem] text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        // Body text per spec — Inter
        "text-[14px] text-[var(--text-muted)] leading-snug",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-[16px]",
        "border-t border-[color:var(--border)]",
        "bg-[var(--bg-card-hover)] px-5 py-4",
        "group-data-[size=sm]/card:px-4 group-data-[size=sm]/card:py-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
