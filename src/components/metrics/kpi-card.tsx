import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClasses = {
  blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  green: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
  amber: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  rose: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
  purple: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40",
} as const;

export type KpiTone = keyof typeof toneClasses;

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: KpiTone;
  sub?: string;
}

export function KpiCard({ label, value, icon: Icon, tone = "blue", sub }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
