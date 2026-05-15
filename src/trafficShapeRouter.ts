// trafficShapeRouter.ts — Express router exposing traffic shape data

import { Router, Request, Response } from 'express';
import {
  getTrafficShape,
  getAllTrafficShapes,
  clearTrafficShapeLog,
} from './routeTrafficShape';

const router = Router();

// GET /routewatch/traffic-shape
// Returns all route traffic shapes
router.get('/', (_req: Request, res: Response) => {
  const shapes = getAllTrafficShapes();
  res.json({ shapes });
});

// GET /routewatch/traffic-shape/:method/:path
// Returns shape for a specific route
router.get('/:method/*', (req: Request, res: Response) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  const entry = getTrafficShape(method, path);
  if (!entry) {
    return res.status(404).json({ error: 'Route not found in traffic log' });
  }
  res.json(entry);
});

// DELETE /routewatch/traffic-shape
// Clears all traffic shape data
router.delete('/', (_req: Request, res: Response) => {
  clearTrafficShapeLog();
  res.json({ message: 'Traffic shape log cleared' });
});

export { router as trafficShapeRouter };
