"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-[10px] p-1 text-[var(--text-muted)] group-data-horizontal/tabs:h-auto group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--muted)] border border-[color:var(--border)]",
        line:    "gap-1 bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Layout
        "relative inline-flex h-auto flex-1 items-center justify-center gap-1.5 rounded-[8px] px-4 py-2",
        // Typography — Inter UI label per spec
        "type-ui-label whitespace-nowrap transition-all",
        // Inactive state
        "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
        // Focus
        "focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:border-ring/50 outline-none",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Active state — azure tint background, deep text
        "data-active:bg-[var(--bg-card)] data-active:text-[var(--color-deep)] data-active:font-semibold",
        "data-active:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(58,180,232,0.20)]",
        // SVG
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-[15px] outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
