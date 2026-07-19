"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RatingChart({
  height = 260,
  data = [],
}: {
  height?: number;
  data?: { date: string; rating: number }[];
}) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No rating history yet — connect Codeforces or LeetCode and sync.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(250, 90%, 60%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(250, 90%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            className="fill-muted-foreground"
            tickFormatter={(v) => String(v).slice(5)}
            minTickGap={32}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            className="fill-muted-foreground"
            domain={["dataMin - 50", "dataMax + 50"]}
            width={48}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
            labelFormatter={(l) => `Date: ${l}`}
          />
          <Area
            type="monotone"
            dataKey="rating"
            stroke="hsl(250, 90%, 60%)"
            strokeWidth={2}
            fill="url(#ratingFill)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
