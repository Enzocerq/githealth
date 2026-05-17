export const HOUR_MS = 1000 * 60 * 60;
export const DAY_MS = HOUR_MS * 24;

/** Milissegundos entre duas datas. */
export function msBetween(start: Date, end: Date): bigint {
  return BigInt(end.getTime() - start.getTime());
}

/** Retorna { start, end } para os últimos N dias (hoje = end). */
export function lastNDaysRange(n: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getTime() - n * DAY_MS);
  return { start, end };
}

/** Início do dia (00:00:00.000) em UTC. */
export function startOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Fim do dia (23:59:59.999) em UTC. */
export function endOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
