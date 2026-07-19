"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function level(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export function CodingHeatmap({
  data = [],
}: {
  data?: { date: string; count: number }[];
}) {
  const cells = React.useMemo(() => {
    if (data.length) return data;
    // empty year if no data
    const out: { date: string; count: number }[] = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 364; i >= 0; i--) {
      const x = new Date(d);
      x.setDate(d.getDate() - i);
      out.push({ date: x.toISOString().slice(0, 10), count: 0 });
    }
    return out;
  }, [data]);

  const weeks: (typeof cells)[] = [];
  let current: typeof cells = [];
  const first = new Date(cells[0]?.date ?? Date.now());
  const pad = first.getDay();
  for (let i = 0; i < pad; i++) {
    current.push({ date: "", count: -1 });
  }
  cells.forEach((c) => {
    current.push(c);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  });
  if (current.length) weeks.push(current);

  const total = cells.reduce((s, c) => s + Math.max(0, c.count), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> activity
          days tracked
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={cn("h-2.5 w-2.5 rounded-sm", `heatmap-${l}`)} />
          ))}
          More
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => {
                if (cell.count < 0) {
                  return <div key={di} className="h-3 w-3" />;
                }
                const lv = level(cell.count);
                return (
                  <Tooltip key={cell.date || di}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-3 w-3 rounded-sm transition-transform hover:scale-125 hover:ring-1 hover:ring-foreground/30",
                          `heatmap-${lv}`
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">
                        {cell.count} submission{cell.count === 1 ? "" : "s"}
                      </p>
                      <p className="text-muted-foreground">{cell.date}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
