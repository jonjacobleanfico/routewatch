// Tracks ownership (team/person) for routes

type OwnerEntry = {
  owner: string;
  contact?: string;
  assignedAt: number;
};

const ownershipMap = new Map<string, OwnerEntry>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setOwner(
  method: string,
  path: string,
  owner: string,
  contact?: string
): void {
  ownershipMap.set(routeKey(method, path), {
    owner,
    contact,
    assignedAt: Date.now(),
  });
}

export function getOwner(
  method: string,
  path: string
): OwnerEntry | undefined {
  return ownershipMap.get(routeKey(method, path));
}

export function removeOwner(method: string, path: string): boolean {
  return ownershipMap.delete(routeKey(method, path));
}

export function getAllOwners(): Record<string, OwnerEntry> {
  const result: Record<string, OwnerEntry> = {};
  for (const [key, entry] of ownershipMap.entries()) {
    result[key] = entry;
  }
  return result;
}

export function getRoutesByOwner(owner: string): string[] {
  const routes: string[] = [];
  for (const [key, entry] of ownershipMap.entries()) {
    if (entry.owner === owner) {
      routes.push(key);
    }
  }
  return routes;
}

export function clearOwnership(): void {
  ownershipMap.clear();
}
