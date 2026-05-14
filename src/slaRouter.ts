import { Router } from 'express';
import {
  setSLARule,
  removeSLARule,
  getSLARule,
  getAllSLARules,
  getSLAStatus,
  getAllSLAStatuses,
  clearSLAViolations,
  clearSLARules,
} from './routeSLA';

export const slaRouter = Router();

// List all SLA rules
slaRouter.get('/rules', (_req, res) => {
  res.json(getAllSLARules());
});

// Add or update an SLA rule
slaRouter.post('/rules', (req, res) => {
  const { route, method, maxResponseTimeMs, maxErrorRate } = req.body;
  if (!route || !method || maxResponseTimeMs == null || maxErrorRate == null) {
    return res.status(400).json({ error: 'route, method, maxResponseTimeMs, and maxErrorRate are required' });
  }
  if (typeof maxResponseTimeMs !== 'number' || maxResponseTimeMs <= 0) {
    return res.status(400).json({ error: 'maxResponseTimeMs must be a positive number' });
  }
  if (typeof maxErrorRate !== 'number' || maxErrorRate < 0 || maxErrorRate > 1) {
    return res.status(400).json({ error: 'maxErrorRate must be between 0 and 1' });
  }
  setSLARule({ route, method, maxResponseTimeMs, maxErrorRate });
  res.status(201).json({ message: 'SLA rule set', route, method });
});

// Get a specific SLA rule
slaRouter.get('/rules/:method/:route(*)', (req, res) => {
  const { method, route } = req.params;
  const rule = getSLARule(method, `/${route}`);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  res.json(rule);
});

// Delete a specific SLA rule
slaRouter.delete('/rules/:method/:route(*)', (req, res) => {
  const { method, route } = req.params;
  const removed = removeSLARule(method, `/${route}`);
  if (!removed) return res.status(404).json({ error: 'Rule not found' });
  res.json({ message: 'Rule removed' });
});

// Get all SLA statuses
slaRouter.get('/status', (_req, res) => {
  res.json(getAllSLAStatuses());
});

// Get SLA status for a specific route
slaRouter.get('/status/:method/:route(*)', (req, res) => {
  const { method, route } = req.params;
  const status = getSLAStatus(method, `/${route}`);
  if (!status) return res.status(404).json({ error: 'No SLA rule found for this route' });
  res.json(status);
});

// Clear all violations
slaRouter.delete('/violations', (_req, res) => {
  clearSLAViolations();
  res.json({ message: 'All SLA violations cleared' });
});

// Clear all rules and violations
slaRouter.delete('/reset', (_req, res) => {
  clearSLARules();
  clearSLAViolations();
  res.json({ message: 'All SLA rules and violations cleared' });
});
