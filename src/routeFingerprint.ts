/**
 * routeFingerprint.ts
 * Generates and tracks a fingerprint (hash) for each route based on its
 * method, path, and optional metadata. Useful for detecting route changes
 * across deployments.
 */

import { createHash } from "crypto";

export interface RouteFingerprint {
  method: string;
  path: string;
  fingerprint: string;
  metadata?: Record<string, unknown>;
  recordedAt: number;
}

const fingerprintStore = new Map<string, RouteFingerprint>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function computeFingerprint(
  method: string,
  path: string,
  metadata?: Record<string, unknown>
): string {
  const payload = JSON.stringify({ method: method.toUpperCase(), path, metadata: metadata ?? {} });
  return createHash("sha256").update(payload).digest("hex").slice(0, 12);
}

export function setRouteFingerprint(
  method: string,
  path: string,
  metadata?: Record<string, unknown>
): RouteFingerprint {
  const key = routeKey(method, path);
  const fingerprint = computeFingerprint(method, path, metadata);
  const entry: RouteFingerprint = {
    method: method.toUpperCase(),
    path,
    fingerprint,
    metadata,
    recordedAt: Date.now(),
  };
  fingerprintStore.set(key, entry);
  return entry;
}

export function getRouteFingerprint(method: string, path: string): RouteFingerprint | undefined {
  return fingerprintStore.get(routeKey(method, path));
}

export function getAllFingerprints(): RouteFingerprint[] {
  return Array.from(fingerprintStore.values());
}

export function hasChanged(
  method: string,
  path: string,
  metadata?: Record<string, unknown>
): boolean {
  const existing = getRouteFingerprint(method, path);
  if (!existing) return true;
  const newFingerprint = computeFingerprint(method, path, metadata);
  return existing.fingerprint !== newFingerprint;
}

export function removeRouteFingerprint(method: string, path: string): boolean {
  return fingerprintStore.delete(routeKey(method, path));
}

export function clearFingerprints(): void {
  fingerprintStore.clear();
}
