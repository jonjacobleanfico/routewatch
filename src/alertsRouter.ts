import { Router, Request, Response } from 'express';
import { getStats } from './tracker';
import { getTriggeredAlerts, evaluateAlerts, AlertRule } from './alerts';

const customRules: AlertRule[] = [];

export function addAlertRule(rule: AlertRule): void {
  customRules.push(rule);
}

export function clearAlertRules(): void {
  customRules.length = 0;
}

export const alertsRouter = Router();

alertsRouter.get('/', (_req: Request, res: Response) => {
  const stats = getStats();
  const rules = customRules.length > 0 ? customRules : undefined;
  const triggered = getTriggeredAlerts(stats, rules);

  res.json({
    count: triggered.length,
    alerts: triggered,
  });
});

alertsRouter.get('/all', (_req: Request, res: Response) => {
  const stats = getStats();
  const rules = customRules.length > 0 ? customRules : undefined;
  const all = evaluateAlerts(stats, rules);

  res.json({
    count: all.length,
    results: all,
  });
});

alertsRouter.get('/summary', (_req: Request, res: Response) => {
  const stats = getStats();
  const triggered = getTriggeredAlerts(stats);

  const summary = triggered.reduce<Record<string, string[]>>((acc, alert) => {
    if (!acc[alert.ruleId]) acc[alert.ruleId] = [];
    acc[alert.ruleId].push(`${alert.method} ${alert.route}`);
    return acc;
  }, {});

  res.json(summary);
});
