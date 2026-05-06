type IpHitRecord = {
  ip: string;
  method: string;
  route: string;
  timestamp: number;
};

type IpStats = {
  ip: string;
  totalHits: number;
  routes: Record<string, number>;
  firstSeen: number;
  lastSeen: number;
};

const ipLog: IpHitRecord[] = [];

export function recordIpHit(ip: string, method: string, route: string): void {
  ipLog.push({ ip, method, route, timestamp: Date.now() });
}

export function getIpStats(ip: string): IpStats | null {
  const hits = ipLog.filter((h) => h.ip === ip);
  if (hits.length === 0) return null;

  const routes: Record<string, number> = {};
  for (const hit of hits) {
    const key = `${hit.method} ${hit.route}`;
    routes[key] = (routes[key] ?? 0) + 1;
  }

  return {
    ip,
    totalHits: hits.length,
    routes,
    firstSeen: Math.min(...hits.map((h) => h.timestamp)),
    lastSeen: Math.max(...hits.map((h) => h.timestamp)),
  };
}

export function getAllIpStats(): IpStats[] {
  const ipSet = new Set(ipLog.map((h) => h.ip));
  return Array.from(ipSet)
    .map((ip) => getIpStats(ip)!)
    .sort((a, b) => b.totalHits - a.totalHits);
}

export function getTopIps(limit = 10): IpStats[] {
  return getAllIpStats().slice(0, limit);
}

export function clearIpLog(): void {
  ipLog.length = 0;
}
