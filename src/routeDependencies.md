# Route Dependencies

Track declared dependencies between API routes — useful for understanding which routes rely on others internally (e.g. `/orders` calls `/users` to enrich a response).

## API

### `addDependency(fromMethod, fromPath, toMethod, toPath, label?)`
Declare that one route depends on another.

```ts
import { addDependency } from './routeDependencies';
addDependency('GET', '/orders', 'GET', '/users', 'fetches user info');
```

### `getDependencies(method, path)`
Get all routes that a given route depends on.

```ts
getDependencies('GET', '/orders');
// => [{ from: 'GET /orders', to: 'GET /users', label: 'fetches user info', addedAt: '...' }]
```

### `getDependents(method, path)`
Get all routes that depend on a given route (reverse lookup).

```ts
getDependents('GET', '/users');
// => [{ from: 'GET /orders', to: 'GET /users', ... }]
```

### `removeDependency(fromMethod, fromPath, toMethod, toPath)`
Remove a specific dependency declaration.

### `getAllDependencies()`
Return all recorded dependency pairs.

### `clearDependencies()`
Reset all stored dependencies.

## HTTP Endpoints (via `routeDependenciesRouter`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/routewatch/dependencies` | List all dependencies |
| `POST` | `/routewatch/dependencies` | Add a dependency |
| `GET` | `/routewatch/dependencies/:method/*?type=dependents` | Get outgoing deps (or dependents) |
| `DELETE` | `/routewatch/dependencies` | Remove a specific dependency |
| `DELETE` | `/routewatch/dependencies/all` | Clear all dependencies |

## Mount

```ts
import { routeDependenciesRouter } from './routeDependenciesRouter';
app.use('/routewatch/dependencies', routeDependenciesRouter);
```
