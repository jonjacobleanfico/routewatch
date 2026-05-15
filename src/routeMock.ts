// routeMock.ts — register mock responses for routes during development

export interface MockResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  delayMs?: number;
}

export interface MockEntry {
  method: string;
  path: string;
  response: MockResponse;
  enabled: boolean;
  hitCount: number;
}

const mockStore = new Map<string, MockEntry>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setMock(method: string, path: string, response: MockResponse): void {
  const key = routeKey(method, path);
  const existing = mockStore.get(key);
  mockStore.set(key, {
    method: method.toUpperCase(),
    path,
    response,
    enabled: true,
    hitCount: existing?.hitCount ?? 0,
  });
}

export function getMock(method: string, path: string): MockEntry | undefined {
  return mockStore.get(routeKey(method, path));
}

export function removeMock(method: string, path: string): boolean {
  return mockStore.delete(routeKey(method, path));
}

export function enableMock(method: string, path: string): void {
  const entry = mockStore.get(routeKey(method, path));
  if (entry) entry.enabled = true;
}

export function disableMock(method: string, path: string): void {
  const entry = mockStore.get(routeKey(method, path));
  if (entry) entry.enabled = false;
}

export function getAllMocks(): MockEntry[] {
  return Array.from(mockStore.values());
}

export function incrementMockHit(method: string, path: string): void {
  const entry = mockStore.get(routeKey(method, path));
  if (entry) entry.hitCount++;
}

export function clearMocks(): void {
  mockStore.clear();
}
