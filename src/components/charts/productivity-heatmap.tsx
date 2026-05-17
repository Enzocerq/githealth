"use client";

const HOURS = [0, 6, 12, 18];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const PERIOD_LABELS = ["Madrugada", "Manha", "Tarde", "Noite"];

export type HeatmapPoint = { day: number; hour: number };

function buildGrid(data: HeatmapPoint[]) {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));

  for (const { day, hour } of data) {
    const col = Math.floor(hour / 6);
    grid[day][col]++;
  }

  return grid;
}

function intensity(count: number, max: number): string {
  if (max === 0 || count === 0) return "bg-muted";
  const ratio = count / max;
  if (ratio < 0.25) return "bg-chart-2/30";
  if (ratio < 0.5) return "bg-chart-2/50";
  if (ratio < 0.75) return "bg-chart-2/75";
  return "bg-chart-2";
}

export function ProductivityHeatmap({ data }: { data: HeatmapPoint[] }) {
  const grid = buildGrid(data);
  const max = Math.max(...grid.flat());

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-10" />
            {PERIOD_LABELS.map((p) => (
              <th key={p} className="text-center font-normal text-muted-foreground">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, dayIdx) => (
            <tr key={day}>
              <td className="pr-2 text-right font-normal text-muted-foreground">{day}</td>
              {HOURS.map((_, colIdx) => {
                const count = grid[dayIdx][colIdx];
                return (
                  <td key={colIdx} className="p-0">
                    <div
                      className={`h-7 rounded ${intensity(count, max)}`}
                      title={`${count} commit${count !== 1 ? "s" : ""}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
