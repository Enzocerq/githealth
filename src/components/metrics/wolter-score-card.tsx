import type { MetricSnapshot } from "@prisma/client";
import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassificationBadge } from "./classification-badge";
import { formatScore } from "@/lib/utils/format";

interface WolterScoreCardProps {
  snapshot: MetricSnapshot | null | undefined;
}

interface ComponentRowProps {
  label: string;
  value: number | null | undefined;
  weight: string;
}

function ComponentRow({ label, value, weight }: ComponentRowProps) {
  const pct = value ?? 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {label}
          <span className="ml-1 text-muted-foreground/60">({weight})</span>
        </span>
        <span className="tabular-nums font-medium">{Math.round(pct)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function WolterScoreCard({ snapshot }: WolterScoreCardProps) {
  const score = snapshot?.wolterScore ?? null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          Score Wolter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold tabular-nums">
            {score != null ? formatScore(score) : "—"}
          </span>
          <span className="mb-1 text-2xl text-muted-foreground">/100</span>
          {score != null && (
            <div className="mb-1">
              <ClassificationBadge score={score} />
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <ComponentRow label="Commits (C)" value={snapshot?.componentC} weight="30%" />
          <ComponentRow label="Pull Requests (P)" value={snapshot?.componentP} weight="25%" />
          <ComponentRow label="Qualidade (Q)" value={snapshot?.componentQ} weight="20%" />
          <ComponentRow label="Reviews (R)" value={snapshot?.componentR} weight="15%" />
          <ComponentRow label="Bug Fix (B)" value={snapshot?.componentB} weight="10%" />
        </div>
      </CardContent>
    </Card>
  );
}
