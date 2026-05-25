/**
 * types/index.ts
 * Single source of truth for all TypeScript interfaces used across the app.
 * Components and composables import from here — never re-declare inline.
 */

// ─── Graph ────────────────────────────────────────────────────────────────────

/** The three node kinds in the heterogeneous graph */
export type NodeKind = 'student' | 'interest' | 'activity'

/** Graph-wide statistics shown in the sidebar */
export interface GraphStats {
  studentsCount: number
  interestsCount: number
  activitiesCount: number
  componentsCount: number
}

/** Result of a BFS shortest-path query between two students */
export interface PathResult {
  /** Full node key path e.g. ['student:A', 'interest:X', 'student:B'] */
  path: string[]
  /** Number of student→student social hops */
  hops: number
  /** Human-readable labels without 'kind:' prefix */
  readable: string[]
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/** A buddy ranked by Jaccard similarity */
export interface BuddyResult {
  name: string
  /** Jaccard similarity score in range [0, 1] */
  jaccard: number
  /** Number of shared interests */
  sharedCount: number
  /** Shared interest names (without 'interest:' prefix) */
  sharedInterests: string[]
}

/** A student found via the buddy search box */
export interface MatchedFriend {
  name: string
  sharedCount: number
  sharedInterests: string[]
}

// ─── Visualization ────────────────────────────────────────────────────────────

/** Tooltip card displayed when hovering a D3 graph node */
export interface HoveredConnectionDetail {
  title: string
  type: NodeKind
  details: string
}

// ─── Auth / Profile ───────────────────────────────────────────────────────────

/** Registration questionnaire form data */
export interface RegForm {
  name: string
  avatar: string
  selectedInterests: string[]
}

/** One row in the domain distribution bar chart */
export interface DomainBar {
  label: string
  icon: string
  count: number
  color: string
  pct: number
}
