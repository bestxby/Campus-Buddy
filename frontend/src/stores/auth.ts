import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useGraphStore } from './graph'
import { AVATAR_OPTIONS, INTEREST_CATEGORIES, DOMAIN_META } from '@/constants/interests'
import type { DomainBar, RegForm } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<string | null>(null)
  const currentUserRole = ref<'student' | 'admin' | null>(null)
  const currentUserAvatar = ref<string>(AVATAR_OPTIONS[0])
  const userPersona = ref<string>('未知')
  const signedUpActivities = ref<string[]>([])

  const regForm = reactive<RegForm>({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    selectedInterests: [],
  })

  function computePersona(interests: string[]): string {
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

  const userInterestTags = computed((): string[] => {
    if (!currentUser.value) return []
    const graphStore = useGraphStore()
    return Array.from(graphStore.graph.get(`student:${currentUser.value}`) ?? [])
      .filter(n => n.startsWith('interest:'))
      .map(n => n.replace('interest:', ''))
  })

  const domainDistribution = computed((): DomainBar[] => {
    const tags = userInterestTags.value
    const total = tags.length || 1
    return DOMAIN_META.map(d => {
      const count = tags.filter(t => (INTEREST_CATEGORIES[d.key] as readonly string[]).includes(t)).length
      return { label: d.label, icon: d.icon, color: d.color, count, pct: Math.round((count / total) * 100) }
    })
  })

  const personaBadgeClass = computed((): string => {
    const p = userPersona.value
    if (p.includes('Tech'))     return 'badge-orange'
    if (p.includes('Sports'))   return 'badge-cyan'
    if (p.includes('Creative')) return 'badge-pink'
    return 'badge-green'
  })

  const previewPersona = computed((): string =>
    regForm.selectedInterests.length === 0 ? '待生成画像...' : computePersona(regForm.selectedInterests)
  )

  const previewPersonaClass = computed((): string => {
    const p = previewPersona.value
    if (p.includes('Tech'))     return 'text-orange'
    if (p.includes('Sports'))   return 'text-cyan'
    if (p.includes('Creative')) return 'text-pink'
    return 'text-green'
  })

  function toggleInterestTag(interest: string): void {
    const idx = regForm.selectedInterests.indexOf(interest)
    if (idx > -1) regForm.selectedInterests.splice(idx, 1)
    else          regForm.selectedInterests.push(interest)
  }

  function submitRegistration(): void {
    const name = regForm.name.trim()
    if (!name || regForm.selectedInterests.length === 0) return

    currentUser.value = name
    currentUserRole.value = 'student'
    currentUserAvatar.value = regForm.avatar
    userPersona.value = computePersona(regForm.selectedInterests)

    localStorage.setItem('campus_buddy_user',      name)
    localStorage.setItem('campus_buddy_role',      'student')
    localStorage.setItem('campus_buddy_avatar',    regForm.avatar)
    localStorage.setItem('campus_buddy_persona',   userPersona.value)
    localStorage.setItem('campus_buddy_interests', JSON.stringify(regForm.selectedInterests))

    const graphStore = useGraphStore()
    const sNode = `student:${name}`
    for (const interest of regForm.selectedInterests) {
      graphStore.addEdge(sNode, `interest:${interest}`)
    }
    graphStore.updateStats()
  }

  async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  async function submitAdminLogin(password: string): Promise<boolean> {
    const hash = await hashPassword(password.trim())
    if (hash !== '3c6a6ef3ab28ad049ea0e4c091d249d6ffe4f8ef69b645a5e855d243980fa877') return false

    currentUser.value = '系统管理员'
    currentUserRole.value = 'admin'
    currentUserAvatar.value = '🤖'
    userPersona.value = '系统管理员 (System Admin)'

    localStorage.setItem('campus_buddy_user',      '系统管理员')
    localStorage.setItem('campus_buddy_role',      'admin')
    localStorage.setItem('campus_buddy_avatar',    '🤖')
    localStorage.setItem('campus_buddy_persona',   userPersona.value)
    localStorage.setItem('campus_buddy_interests', JSON.stringify([]))

    const graphStore = useGraphStore()
    graphStore.updateStats()
    return true
  }

  function restoreSession(): void {
    const savedUser = localStorage.getItem('campus_buddy_user')
    if (!savedUser) return

    currentUser.value = savedUser
    currentUserRole.value = (localStorage.getItem('campus_buddy_role') as 'student' | 'admin') ?? 'student'
    currentUserAvatar.value = localStorage.getItem('campus_buddy_avatar') ?? '🧭'
    userPersona.value = localStorage.getItem('campus_buddy_persona') ?? '普通同学'

    const graphStore = useGraphStore()
    const savedInterests: string[] = JSON.parse(localStorage.getItem('campus_buddy_interests') ?? '[]')
    const sNode = `student:${savedUser}`
    for (const interest of savedInterests) {
      graphStore.addEdge(sNode, `interest:${interest}`)
    }

    const savedSignups: string[] = JSON.parse(localStorage.getItem('campus_buddy_signups') ?? '[]')
    signedUpActivities.value = savedSignups
    for (const act of savedSignups) {
      graphStore.addEdge(sNode, `activity:${act}`)
    }
  }

  async function logout(): Promise<void> {
    localStorage.clear()
    currentUser.value = null
    currentUserRole.value = null
    currentUserAvatar.value = AVATAR_OPTIONS[0]
    userPersona.value = '未知'
    signedUpActivities.value = []
    regForm.selectedInterests = []
    regForm.name = ''
    regForm.avatar = AVATAR_OPTIONS[0]

    const graphStore = useGraphStore()
    graphStore.graph.clear()
    await graphStore.loadGraphData()
  }

  function signUpForActivity(activity: string): void {
    if (!currentUser.value) return
    const graphStore = useGraphStore()
    const sNode = `student:${currentUser.value}`
    graphStore.addEdge(sNode, `activity:${activity}`)
    if (!signedUpActivities.value.includes(activity)) {
      signedUpActivities.value.push(activity)
      localStorage.setItem('campus_buddy_signups', JSON.stringify(signedUpActivities.value))
    }
    graphStore.updateStats()
  }

  function cancelSignUpForActivity(activity: string): void {
    if (!currentUser.value) return
    const graphStore = useGraphStore()
    const sNode = `student:${currentUser.value}`
    const actNode = `activity:${activity}`
    if (graphStore.graph.has(sNode)) {
      graphStore.graph.get(sNode)!.delete(actNode)
    }
    if (graphStore.graph.has(actNode)) {
      graphStore.graph.get(actNode)!.delete(sNode)
    }
    const idx = signedUpActivities.value.indexOf(activity)
    if (idx > -1) {
      signedUpActivities.value.splice(idx, 1)
      localStorage.setItem('campus_buddy_signups', JSON.stringify(signedUpActivities.value))
    }
    graphStore.updateStats()
  }

  function isSignedUp(activity: string): boolean {
    return signedUpActivities.value.includes(activity)
  }

  return {
    currentUser,
    currentUserRole,
    currentUserAvatar,
    userPersona,
    signedUpActivities,
    regForm,
    computePersona,
    userInterestTags,
    domainDistribution,
    personaBadgeClass,
    previewPersona,
    previewPersonaClass,
    toggleInterestTag,
    submitRegistration,
    submitAdminLogin,
    restoreSession,
    logout,
    signUpForActivity,
    cancelSignUpForActivity,
    isSignedUp,
  }
})
