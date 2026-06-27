"use client";

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Point = { day: string; value: number; count: number };

export function ReceivingTrendChart({ data }: { data: Point[] }) {
  const fmt = data.map((d) => ({ ...d, label: d.day.slice(5) }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <ComposedChart data={fmt} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="recv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f9e6f" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#2f9e6f" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f3350" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#8aa0bd", fontSize: 11 }} axisLine={{ stroke: "#1f3350" }} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: "#8aa0bd", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#8aa0bd", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#15233a", border: "1px solid #1f3350", borderRadius: 8, color: "#e7edf5" }}
            labelStyle={{ color: "#8aa0bd" }}
          />
          <Area yAxisId="left" type="monotone" dataKey="value" name="Received value" stroke="#2f9e6f" strokeWidth={2} fill="url(#recv)" />
          <Line yAxisId="right" type="monotone" dataKey="count" name="Receipt count" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
