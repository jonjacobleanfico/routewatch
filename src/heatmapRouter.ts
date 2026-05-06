import { Router, Request, Response } from 'express';
import { getHeatmapData, getTopHours, clearHeatmapData } from './heatmap';

const router = Router();

router.get('/heatmap', (req: Request, res: Response) => {
  const route = typeof req.query.route === 'string' ? req.query.route : undefined;
  const data = getHeatmapData(route);
  res.json(data);
});

router.get('/heatmap/top-hours', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: 'Invalid limit parameter' });
  }
  const topHours = getTopHours(limit);
  res.json({ topHours });
});

router.delete('/heatmap', (_req: Request, res: Response) => {
  clearHeatmapData();
  res.json({ message: 'Heatmap data cleared' });
});

export { router as heatmapRouter };
