import { Router, Request, Response } from 'express';
import {
  addNote,
  getNotes,
  removeNote,
  clearNotes,
  getAllNotes,
  clearAllNotes,
} from './routeNotes';

const router = Router();

// GET /routewatch/notes — list all notes
router.get('/', (_req: Request, res: Response) => {
  res.json(getAllNotes());
});

// GET /routewatch/notes/:method/:path — get notes for a specific route
router.get('/:method/*', (req: Request, res: Response) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  res.json(getNotes(method, path));
});

// POST /routewatch/notes/:method/:path — add a note
router.post('/:method/*', (req: Request, res: Response) => {
  const method = req.params.method;
  const path = '/' + (req.params as any)[0];
  const { note } = req.body as { note?: string };
  if (!note || typeof note !== 'string') {
    return res.status(400).json({ error: 'note (string) is required' });
  }
  addNote(method, path, note);
  res.status(201).json({ message: 'Note added', notes: getNotes(method, path) });
});

// DELETE /routewatch/notes/:method/:path/:index — remove a note by index
router.delete('/:method/*/:index', (req: Request, res: Response) => {
  const method = req.params.method;
  const parts = (req.params as any)[0].split('/');
  const index = parseInt(req.params.index, 10);
  const path = '/' + parts.slice(0, -1).join('/');
  if (isNaN(index)) {
    return res.status(400).json({ error: 'index must be a number' });
  }
  const removed = removeNote(method, path, index);
  if (!removed) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Note removed', notes: getNotes(method, path) });
});

// DELETE /routewatch/notes — clear all notes
router.delete('/', (_req: Request, res: Response) => {
  clearAllNotes();
  res.json({ message: 'All notes cleared' });
});

export default router;
