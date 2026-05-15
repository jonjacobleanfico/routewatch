// mockRouter.ts — REST API to manage route mocks

import { Router, Request, Response } from "express";
import {
  setMock,
  getMock,
  removeMock,
  enableMock,
  disableMock,
  getAllMocks,
  clearMocks,
} from "./routeMock";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(getAllMocks());
});

router.post("/", (req: Request, res: Response) => {
  const { method, path, response } = req.body;
  if (!method || !path || !response) {
    return res.status(400).json({ error: "method, path, and response are required" });
  }
  if (typeof response.status !== "number") {
    return res.status(400).json({ error: "response.status must be a number" });
  }
  setMock(method, path, response);
  res.status(201).json(getMock(method, path));
});

router.get("/:method/:path(*)", (req: Request, res: Response) => {
  const entry = getMock(req.params.method, "/" + req.params.path);
  if (!entry) return res.status(404).json({ error: "mock not found" });
  res.json(entry);
});

router.delete("/:method/:path(*)", (req: Request, res: Response) => {
  const removed = removeMock(req.params.method, "/" + req.params.path);
  if (!removed) return res.status(404).json({ error: "mock not found" });
  res.json({ removed: true });
});

router.patch("/:method/:path(*)/enable", (req: Request, res: Response) => {
  enableMock(req.params.method, "/" + req.params.path);
  res.json({ enabled: true });
});

router.patch("/:method/:path(*)/disable", (req: Request, res: Response) => {
  disableMock(req.params.method, "/" + req.params.path);
  res.json({ enabled: false });
});

router.delete("/", (_req: Request, res: Response) => {
  clearMocks();
  res.json({ cleared: true });
});

export { router as mockRouter };
