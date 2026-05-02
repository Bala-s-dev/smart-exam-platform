import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-border bg-white px-3.5 py-3 text-[14px] text-foreground",
        "placeholder:text-muted-foreground/60",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
