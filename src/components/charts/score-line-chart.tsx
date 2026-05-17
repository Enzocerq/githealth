"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type ScoreSeriesPoint = {
  date: string;
  score: number;
  repositoryAverage: number;
};

export function ScoreLineChart({ data }: { data: ScoreSeriesPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value, name) => [
            typeof value === "number" ? Math.round(value) : value,
            name === "score" ? "Você" : "Média repos",
          ]}
        />
        <Legend
          formatter={(value) => (value === "score" ? "Você" : "Média repos")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="repositoryAverage"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
