import { Router, Request, Response } from "express";
import {
  setAnnotation,
  getAnnotation,
  removeAnnotation,
  getAllAnnotations,
  clearAnnotations,
} from "./annotations";

export const annotationsRouter = Router();

// GET /annotations — list all annotations
annotationsRouter.get("/", (_req: Request, res: Response) => {
  res.json(getAllAnnotations());
});

// GET /annotations/:method/:path — get annotation for a specific route
annotationsRouter.get("/route", (req: Request, res: Response) => {
  const routeKey = req.query.route as string;
  if (!routeKey) {
    return res.status(400).json({ error: "Missing 'route' query parameter" });
  }
  const annotation = getAnnotation(routeKey);
  if (annotation === undefined) {
    return res.status(404).json({ error: "No annotation found for route" });
  }
  res.json({ route: routeKey, annotation });
});

// POST /annotations — set or update an annotation
annotationsRouter.post("/", (req: Request, res: Response) => {
  const { route, annotation } = req.body as {
    route?: string;
    annotation?: string;
  };
  if (!route || typeof annotation !== "string") {
    return res
      .status(400)
      .json({ error: "'route' and 'annotation' are required" });
  }
  setAnnotation(route, annotation);
  res.status(201).json({ route, annotation });
});

// DELETE /annotations — remove annotation for a route
annotationsRouter.delete("/", (req: Request, res: Response) => {
  const routeKey = req.query.route as string;
  if (!routeKey) {
    return res.status(400).json({ error: "Missing 'route' query parameter" });
  }
  removeAnnotation(routeKey);
  res.status(204).send();
});

// DELETE /annotations/all — clear all annotations
annotationsRouter.delete("/all", (_req: Request, res: Response) => {
  clearAnnotations();
  res.status(204).send();
});
