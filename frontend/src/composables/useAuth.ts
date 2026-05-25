/**
 * composables/useAuth.ts
 * User authentication state, persona computation, and activity sign-ups.
 *
 * Responsibilities: registration form state, localStorage persistence,
 *   user profile computed values, sign-up tracking.
 *
 * Layer: Service (auth/profile logic)
 * Depends on: useGraph (addEdge, updateStats, nodeKey — one-way only)
 */
import { ref, reactive, computed } from 'vue'
import { graph, addEdge, nodeKey, updateStats, loadGraphData } from '@/composables/useGraph'
import { AVATAR_OPTIONS, INTEREST_CATEGORIES, DOMAIN_META } from '@/constants/interests'
import type { DomainBar, RegForm } from '@/types'

// ─── State ────────────────────────────────────────────────────────────────────

export const currentUser        = ref<string | null>(null)
export const currentUserRole    = ref<'student' | 'admin' | null>(null)
export const currentUserAvatar  = ref<string>(AVATAR_OPTIONS[0])
export const userPersona        = ref<string>('未知')
export const signedUpActivities = ref<string[]>([])

export const regForm = reactive<RegForm>({
  name: '',
  avatar: AVATAR_OPTIONS[0],
  selectedInterests: [],
})

// ─── Persona Logic ────────────────────────────────────────────────────────────

/** Computes a persona label from an array of selected interest tags */
export const computePersona = (interests: string[]): string => {
  const counts = {
    sports: interests.filter(x => (INTEREST_CATEGORIES.sports as readonly string[]).includes(x)).length,
    tech:   interests.filter(x => (INTEREST_CATEGORIES.tech   as readonly string[]).includes(x)).length,
    arts:   interests.filter(x => (INTEREST_CATEGORIES.arts   as readonly string[]).includes(x)).length,
    social: interests.filter(x => (INTEREST_CATEGORIES.social as readonly string[]).includes(x)).length,
  }
  const max = Math.max(...Object.values(counts))
  if (max === counts.tech)   return '科技极客 (Tech Geek)'
  if (max === counts.sports) return '运动健将 (Sports Fan)'
  if (max === counts.arts)   return '文艺青年 (Creative Artist)'
  return '社交达人 (Social Hub)'
}

// ─── Computed ─────────────────────────────────────────────────────────────────

/** Current user's interest tags read from the graph */
export const userInterestTags = computed((): string[] => {
  if (!currentUser.value) return []
  return Array.from(graph.value.get(nodeKey('student', currentUser.value)) ?? [])
    .filter(n => n.startsWith('interest:'))
    .map(n => n.replace('interest:', ''))
})

/** Domain distribution bar data for the sidebar profile card */
export const domainDistribution = computed((): DomainBar[] => {
  const tags  = userInterestTags.value
  const total = tags.length || 1
  return DOMAIN_META.map(d => {
    const count = tags.filter(t => (INTEREST_CATEGORIES[d.key] as readonly string[]).includes(t)).length
    return { label: d.label, icon: d.icon, color: d.color, count, pct: Math.round((count / total) * 100) }
  })
})

/** CSS class for the persona badge in the sidebar */
export const personaBadgeClass = computed((): string => {
  const p = userPersona.value
  if (p.includes('Tech'))     return 'badge-orange'
  if (p.includes('Sports'))   return 'badge-cyan'
  if (p.includes('Creative')) return 'badge-pink'
  return 'badge-green'
})

/** Live persona label shown in the registration overlay */
export const previewPersona = computed((): string =>
  regForm.selectedInterests.length === 0 ? '待生成画像...' : computePersona(regForm.selectedInterests)
)

/** CSS class for the live persona preview text */
export const previewPersonaClass = computed((): string => {
  const p = previewPersona.value
  if (p.includes('Tech'))     return 'text-orange'
  if (p.includes('Sports'))   return 'text-cyan'
  if (p.includes('Creative')) return 'text-pink'
  return 'text-green'
})

// ─── Registration Form Helpers ────────────────────────────────────────────────

export const toggleInterestTag = (interest: string): void => {
  const idx = regForm.selectedInterests.indexOf(interest)
  if (idx > -1) regForm.selectedInterests.splice(idx, 1)
  else          regForm.selectedInterests.push(interest)
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────

/**
 * Creates the user node in the graph and persists session to localStorage.
 * After calling this, App.vue should call selectStudent() to trigger recommendations.
 */
export const submitRegistration = (): void => {
  const name = regForm.name.trim()
  if (!name || regForm.selectedInterests.length === 0) return

  currentUser.value       = name
  currentUserRole.value   = 'student'
  currentUserAvatar.value = regForm.avatar
  userPersona.value       = computePersona(regForm.selectedInterests)

  localStorage.setItem('campus_buddy_user',      name)
  localStorage.setItem('campus_buddy_role',      'student')
  localStorage.setItem('campus_buddy_avatar',    regForm.avatar)
  localStorage.setItem('campus_buddy_persona',   userPersona.value)
  localStorage.setItem('campus_buddy_interests', JSON.stringify(regForm.selectedInterests))

  const sNode = nodeKey('student', name)
  for (const interest of regForm.selectedInterests) {
    addEdge(sNode, nodeKey('interest', interest))
  }
  updateStats()
}

/** Hashes a string using SHA-256 (Web Crypto API) */
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Validates admin password using SHA-256 hash and signs in.
 */
export const submitAdminLogin = async (password: string): Promise<boolean> => {
  const hash = await hashPassword(password.trim())
  if (hash !== '3c6a6ef3ab28ad049ea0e4c091d249d6ffe4f8ef69b645a5e855d243980fa877') return false

  currentUser.value       = '系统管理员'
  currentUserRole.value   = 'admin'
  currentUserAvatar.value = '🤖'
  userPersona.value       = '系统管理员 (System Admin)'

  localStorage.setItem('campus_buddy_user',      '系统管理员')
  localStorage.setItem('campus_buddy_role',      'admin')
  localStorage.setItem('campus_buddy_avatar',    '🤖')
  localStorage.setItem('campus_buddy_persona',   userPersona.value)
  localStorage.setItem('campus_buddy_interests', JSON.stringify([]))

  updateStats()
  return true
}

/**
 * Restores a saved session from localStorage into the graph.
 * Called once on app mount after loadGraphData() completes.
 */
export const restoreSession = (): void => {
  const savedUser = localStorage.getItem('campus_buddy_user')
  if (!savedUser) return

  currentUser.value       = savedUser
  currentUserRole.value   = (localStorage.getItem('campus_buddy_role') as 'student' | 'admin') ?? 'student'
  currentUserAvatar.value = localStorage.getItem('campus_buddy_avatar') ?? '🧭'
  userPersona.value       = localStorage.getItem('campus_buddy_persona') ?? '普通同学'

  const savedInterests: string[] = JSON.parse(localStorage.getItem('campus_buddy_interests') ?? '[]')
  const sNode = nodeKey('student', savedUser)
  for (const interest of savedInterests) {
    addEdge(sNode, nodeKey('interest', interest))
  }

  const savedSignups: string[] = JSON.parse(localStorage.getItem('campus_buddy_signups') ?? '[]')
  signedUpActivities.value = savedSignups
  for (const act of savedSignups) {
    addEdge(sNode, nodeKey('activity', act))
  }
}

/** Clears all session data, resets the graph, and reloads the base dataset */
export const logout = async (): Promise<void> => {
  localStorage.clear()
  currentUser.value        = null
  currentUserRole.value    = null
  currentUserAvatar.value  = AVATAR_OPTIONS[0]
  userPersona.value        = '未知'
  signedUpActivities.value = []
  regForm.selectedInterests = []
  regForm.name   = ''
  regForm.avatar = AVATAR_OPTIONS[0]
  graph.value.clear()
  await loadGraphData()
}

/** Registers the current user for an activity (adds edge + persists) */
export const signUpForActivity = (activity: string): void => {
  if (!currentUser.value) return
  const sNode = nodeKey('student', currentUser.value)
  addEdge(sNode, nodeKey('activity', activity))
  if (!signedUpActivities.value.includes(activity)) {
    signedUpActivities.value.push(activity)
    localStorage.setItem('campus_buddy_signups', JSON.stringify(signedUpActivities.value))
  }
  updateStats()
}

/** Returns true if the current user is signed up for the given activity */
export const isSignedUp = (activity: string): boolean =>
  signedUpActivities.value.includes(activity)
