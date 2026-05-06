import { Router, Request, Response } from 'express';
import {
  getReplayLog,
  replayHits,
  replayByRoute,
  clearReplayLog,
} from './replay';

export const replayRouter = Router();

// GET /replay — return full replay log
replayRouter.get('/', (_req: Request, res: Response) => {
  const log = getReplayLog();
  res.json({ count: log.length, hits: log });
});

// POST /replay/run — replay all (or filtered) hits
replayRouter.post('/run', (req: Request, res: Response) => {
  const { method, path: routePath } = req.body as {
    method?: string;
    path?: string;
  };

  let replayed;
  if (method && routePath) {
    replayed = replayByRoute(method, routePath);
  } else {
    replayed = replayHits();
  }

  res.json({ replayed: replayed.length, hits: replayed });
});

// DELETE /replay — clear the replay log
replayRouter.delete('/', (_req: Request, res: Response) => {
  clearReplayLog();
  res.json({ message: 'Replay log cleared.' });
});
