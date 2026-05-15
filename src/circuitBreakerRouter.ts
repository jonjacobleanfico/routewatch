import { Router } from 'express';
import {
  setCircuitBreakerRule,
  getCircuit,
  getAllCircuits,
  resetCircuit,
  clearAllCircuits,
  CircuitBreakerRule,
} from './routeCircuitBreaker';

const router = Router();

// GET /routewatch/circuit-breaker
router.get('/', (_req, res) => {
  res.json(getAllCircuits());
});

// GET /routewatch/circuit-breaker/:method/:path
router.get('/:method/*', (req, res) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  const entry = getCircuit(method, path);
  if (!entry) return res.status(404).json({ error: 'No circuit breaker found for route' });
  res.json(entry);
});

// POST /routewatch/circuit-breaker
// Body: { method, path, failureThreshold, successThreshold, timeoutMs }
router.post('/', (req, res) => {
  const { method, path, failureThreshold, successThreshold, timeoutMs } = req.body;
  if (!method || !path || failureThreshold == null || successThreshold == null || timeoutMs == null) {
    return res.status(400).json({ error: 'method, path, failureThreshold, successThreshold, and timeoutMs are required' });
  }
  const rule: CircuitBreakerRule = {
    failureThreshold: Number(failureThreshold),
    successThreshold: Number(successThreshold),
    timeoutMs: Number(timeoutMs),
  };
  setCircuitBreakerRule(method, path, rule);
  res.status(201).json({ message: 'Circuit breaker rule set', method, path, rule });
});

// POST /routewatch/circuit-breaker/reset/:method/*
router.post('/reset/:method/*', (req, res) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  resetCircuit(method, path);
  res.json({ message: 'Circuit reset', method, path });
});

// DELETE /routewatch/circuit-breaker
router.delete('/', (_req, res) => {
  clearAllCircuits();
  res.json({ message: 'All circuits cleared' });
});

export default router;
