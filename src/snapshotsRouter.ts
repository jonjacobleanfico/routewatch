import { Router, Request, Response } from 'express';
import {
  takeSnapshot,
  getSnapshot,
  listSnapshots,
  deleteSnapshot,
  clearSnapshots,
  diffSnapshots,
} from './snapshots';

export const snapshotsRouter = Router();

snapshotsRouter.post('/', (req: Request, res: Response) => {
  const { label } = req.body ?? {};
  const snapshot = takeSnapshot(label);
  res.status(201).json(snapshot);
});

snapshotsRouter.get('/', (_req: Request, res: Response) => {
  res.json(listSnapshots());
});

snapshotsRouter.get('/:id', (req: Request, res: Response) => {
  const snapshot = getSnapshot(req.params.id);
  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }
  res.json(snapshot);
});

snapshotsRouter.delete('/all', (_req: Request, res: Response) => {
  clearSnapshots();
  res.json({ message: 'All snapshots cleared' });
});

snapshotsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = deleteSnapshot(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }
  res.json({ message: 'Snapshot deleted', id: req.params.id });
});

snapshotsRouter.get('/diff/:idA/:idB', (req: Request, res: Response) => {
  try {
    const diff = diffSnapshots(req.params.idA, req.params.idB);
    res.json(diff);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});
