# routewatch

Lightweight Express middleware for logging and visualizing API route usage in development.

## Installation

```bash
npm install routewatch
```

## Usage

```typescript
import express from "express";
import { routewatch } from "routewatch";

const app = express();

// Add routewatch middleware before your routes
app.use(routewatch());

app.get("/users", (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

Once your server is running, routewatch will log incoming requests to the console and track usage stats across all registered routes. A summary table is printed on process exit.

**Example output:**

```
[routewatch] GET /users 200 — 4ms
[routewatch] POST /users 201 — 11ms

Route Usage Summary:
┌─────────────────┬────────┬──────────┐
│ Route           │ Method │ Hits     │
├─────────────────┼────────┼──────────┤
│ /users          │ GET    │ 42       │
│ /users          │ POST   │ 7        │
└─────────────────┴────────┴──────────┘
```

### Options

```typescript
app.use(routewatch({
  logLevel: "verbose",   // "minimal" | "verbose" (default: "minimal")
  color: true,           // colorize console output (default: true)
  summary: true,         // print summary on exit (default: true)
}));
```

> **Note:** routewatch is intended for development use only. Disable or remove it before deploying to production.

## License

MIT