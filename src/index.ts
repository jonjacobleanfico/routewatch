/**
 * routewatch — public API
 *
 * Usage:
 *   import { routewatch, dashboardRouter } from 'routewatch';
 *
 *   app.use(routewatch());
 *   app.use(dashboardRouter({ format: 'html' }));
 */

export { routewatch } from './middleware';
export { recordHit, getStats, resetStats } from './tracker';
export { generateReport, formatReportAsTable } from './reporter';
export { dashboardRouter } from './dashboard';
export type { DashboardOptions } from './dashboard';

import { routewatch } from './middleware';
export default routewatch;
