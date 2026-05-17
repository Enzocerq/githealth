import { Badge } from "@/components/ui/badge";
import { scoreClassification } from "@/lib/metrics/wolter";

const variantMap = {
  Alta: "success",
  Boa: "success",
  Moderada: "amber",
  Baixa: "destructive",
} as const;

export function ClassificationBadge({ score }: { score: number }) {
  const label = scoreClassification(score);
  return <Badge variant={variantMap[label]}>{label}</Badge>;
}
