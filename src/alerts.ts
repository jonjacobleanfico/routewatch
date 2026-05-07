import { RouteStats } from './tracker';

export interface AlertRule {
  id: string;
  description: string;
  check: (stats: RouteStats) => boolean;
}

export interface AlertResult {
  ruleId: string;
  description: string;
  route: string;
  method: string;
  triggered: boolean;
}

const defaultRules: AlertRule[] = [
  {
    id: 'high-error-rate',
    description: 'Error rate exceeds 20%',
    check: (stats) => {
      const total = stats.hits;
      if (total === 0) return false;
      return stats.errorCount / total > 0.2;
    },
  },
  {
    id: 'slow-response',
    description: 'Average response time exceeds 1000ms',
    check: (stats) => stats.avgDuration > 1000,
  },
  {
    id: 'high-traffic',
    description: 'Route hit more than 500 times',
    check: (stats) => stats.hits > 500,
  },
];

/**
 * Evaluates all alert rules against each route's stats and returns only
 * the results where a rule was triggered.
 */
export function evaluateAlerts(
  statsMap: Record<string, RouteStats>,
  rules: AlertRule[] = defaultRules
): AlertResult[] {
  const results: AlertResult[] = [];

  for (const [key, stats] of Object.entries(statsMap)) {
    const [method, route] = key.split(' ');
    for (const rule of rules) {
      results.push({
        ruleId: rule.id,
        description: rule.description,
        route,
        method,
        triggered: rule.check(stats),
      });
    }
  }

  return results.filter((r) => r.triggered);
}

/**
 * Returns triggered alerts grouped by rule ID for easier consumption
 * when summarising alert state across all routes.
 */
export function groupAlertsByRule(
  statsMap: Record<string, RouteStats>,
  rules?: AlertRule[]
): Record<string, AlertResult[]> {
  const triggered = evaluateAlerts(statsMap, rules);
  return triggered.reduce<Record<string, AlertResult[]>>((acc, result) => {
    if (!acc[result.ruleId]) {
      acc[result.ruleId] = [];
    }
    acc[result.ruleId].push(result);
    return acc;
  }, {});
}

export function getTriggeredAlerts(
  statsMap: Record<string, RouteStats>,
  rules?: AlertRule[]
): AlertResult[] {
  return evaluateAlerts(statsMap, rules);
}
