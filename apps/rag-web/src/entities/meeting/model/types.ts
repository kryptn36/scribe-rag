import { meetings } from '@/shared/api/db/schema';

/**
 * Drizzle-inferred type for a meeting row.
 * Use this as the canonical type throughout the app instead of the manual interface.
 */
export type Meeting = typeof meetings.$inferSelect;
