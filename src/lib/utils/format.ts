/** Formata número com separador de milhar no padrão pt-BR. */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR");
}

/** Formata percentual com uma casa decimal. Ex: "87,3%" */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1).replace(".", ",")}%`;
}

/** Formata horas com uma casa decimal. Ex: "12,5h" */
export function formatHours(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1).replace(".", ",")}h`;
}

/** Formata dias com uma casa decimal. Ex: "3,2d" */
export function formatDays(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${(value / 24).toFixed(1).replace(".", ",")}d`;
}

/** Formata score (0–100) sem casas decimais. */
export function formatScore(value: number | null | undefined): string {
  if (value == null) return "—";
  return Math.round(value).toString();
}
