export interface RouteHealthScore {
  route: string;
  method: string;
  score: number; // 0-100
  reasons: string[];
}

export interface RouteHealthSummary {
  overall: number;
  routes: RouteHealthScore[];
}

const ERROR_RATE_THRESHOLD = 0.2;
const SLOW_RESPONSE_THRESHOLD_MS = 1000;
const MIN_HITS_FOR_SCORING = 5;

export function computeRouteHealth(
  route: string,
  method: string,
  opts: {
    totalHits: number;
    errorCount: number;
    avgResponseTimeMs: number;
    p95ResponseTimeMs: number;
  }
): RouteHealthScore {
  const { totalHits, errorCount, avgResponseTimeMs, p95ResponseTimeMs } = opts;
  const reasons: string[] = [];
  let score = 100;

  if (totalHits < MIN_HITS_FOR_SCORING) {
    return { route, method, score: -1, reasons: ['insufficient data'] };
  }

  const errorRate = errorCount / totalHits;
  if (errorRate >= ERROR_RATE_THRESHOLD) {
    const penalty = Math.min(50, Math.round(errorRate * 100));
    score -= penalty;
    reasons.push(`high error rate: ${(errorRate * 100).toFixed(1)}%`);
  }

  if (avgResponseTimeMs > SLOW_RESPONSE_THRESHOLD_MS) {
    const penalty = Math.min(30, Math.round((avgResponseTimeMs / SLOW_RESPONSE_THRESHOLD_MS - 1) * 15));
    score -= penalty;
    reasons.push(`slow avg response: ${avgResponseTimeMs.toFixed(0)}ms`);
  }

  if (p95ResponseTimeMs > SLOW_RESPONSE_THRESHOLD_MS * 2) {
    const penalty = Math.min(20, Math.round((p95ResponseTimeMs / (SLOW_RESPONSE_THRESHOLD_MS * 2) - 1) * 10));
    score -= penalty;
    reasons.push(`slow p95 response: ${p95ResponseTimeMs.toFixed(0)}ms`);
  }

  if (reasons.length === 0) {
    reasons.push('healthy');
  }

  return { route, method, score: Math.max(0, score), reasons };
}

export function summarizeHealth(scores: RouteHealthScore[]): RouteHealthSummary {
  const valid = scores.filter((s) => s.score >= 0);
  const overall =
    valid.length === 0
      ? 100
      : Math.round(valid.reduce((sum, s) => sum + s.score, 0) / valid.length);
  return { overall, routes: scores };
}
