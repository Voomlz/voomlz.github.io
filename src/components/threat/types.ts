/**
 * Common types for threat components
 *
 * Note: Most component types are now co-located with their components.
 * Only shared utility types that don't belong to a specific component are kept here.
 */

/**
 * URL parameter structure for deep linking
 */
export interface UrlParams {
  id: string | null;
  fightId: string | null;
  enemy: string | null;
  target: string | null;
}
