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
  
  // Mapear el idioma de la app a los locales de date-fns
  const currentLocale = language === 'english' ? enUS : es;

  return (
    <DayPicker
      locale={currentLocale}
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-2 relative items-center mb-4",
        caption_label: "text-2xl font-bold tracking-tighter text-foreground uppercase",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background/50 p-0 opacity-50 hover:opacity-100 rounded-full border-primary/20"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse table-fixed border-t border-l border-muted/30",
        head_row: "flex w-full bg-black dark:bg-zinc-900",
        head_cell:
          "text-white rounded-none font-bold text-[0.6rem] uppercase tracking-widest flex-1 text-center py-3 border-r border-muted/20",
        row: "flex w-full",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 flex justify-center items-center h-14 border-r border-b border-muted/30",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : ""
        ),
        day: cn(
          "h-full w-full p-0 font-medium aria-selected:opacity-100 hover:bg-primary/10 transition-all rounded-none text-xs flex items-start p-2 justify-start"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary/20 text-primary font-bold hover:bg-primary/30 focus:bg-primary/20",
        day_today: "bg-accent/10 text-accent font-bold",
        day_outside:
          "day-outside text-muted-foreground/30 bg-muted/5 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
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
