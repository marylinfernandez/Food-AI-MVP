
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es, enUS } from "date-fns/locale"
import { useTranslation } from "@/context/language-context"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { language } = useTranslation();
  const currentLocale = language === 'english' ? enUS : es;

  return (
    <DayPicker
      locale={currentLocale}
      showOutsideDays={showOutsideDays}
      className={cn("p-0 w-full", className)}
      classNames={{
        months: "flex flex-col space-y-0 w-full",
        month: "space-y-0 w-full",
        caption: "flex justify-center pt-8 pb-8 relative items-center bg-background/50",
        caption_label: "text-2xl font-bold tracking-widest text-foreground uppercase text-center w-full",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background/50 p-0 opacity-50 hover:opacity-100 rounded-full border-primary/20"
        ),
        nav_button_previous: "absolute left-4",
        nav_button_next: "absolute right-4",
        table: "w-full border-collapse block",
        thead: "w-full bg-black dark:bg-zinc-900 block",
        tbody: "w-full block",
        head_row: "grid grid-cols-7 w-full",
        head_cell: "text-white font-bold text-[0.65rem] uppercase tracking-widest text-center py-4 border-r border-white/10 last:border-r-0 flex items-center justify-center",
        row: "grid grid-cols-7 w-full border-b border-muted/30 last:border-b-0",
        cell: "relative text-center text-sm h-14 flex items-stretch justify-stretch overflow-hidden border-r border-muted/30 last:border-r-0 p-0",
        day: cn(
          "h-full w-full flex items-center justify-center p-0 font-medium transition-all hover:bg-primary/10 text-xs",
          "aria-selected:bg-primary/20 aria-selected:text-primary aria-selected:font-bold aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: "bg-primary/20 text-primary font-bold hover:bg-primary/30",
        day_today: "bg-accent/10 text-accent font-bold",
        day_outside: "day-outside text-muted-foreground/30 bg-muted/5 opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
