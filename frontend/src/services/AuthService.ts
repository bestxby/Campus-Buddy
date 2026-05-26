import { ref, reactive, computed } from 'vue'
import { graphService } from './GraphService'
import { AVATAR_OPTIONS, INTEREST_CATEGORIES, DOMAIN_META } from '@/constants/interests'
import type { DomainBar, RegForm } from '@/types'

export class AuthService {
  private static instance: AuthService

  public readonly currentUser        = ref<string | null>(null)
  public readonly currentUserRole    = ref<'student' | 'admin' | null>(null)
  public readonly currentUserAvatar  = ref<string>(AVATAR_OPTIONS[0])
  public readonly userPersona        = ref<string>('未知')
  public readonly signedUpActivities = ref<string[]>([])

  public readonly regForm = reactive<RegForm>({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    selectedInterests: [],
  })

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public computePersona(interests: string[]): string {
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

  // Getters / Computed as properties
  public readonly userInterestTags = computed((): string[] => {
    if (!this.currentUser.value) return []
    return Array.from(graphService.graph.value.get(graphService.nodeKey('student', this.currentUser.value)) ?? [])
      .filter(n => n.startsWith('interest:'))
      .map(n => n.replace('interest:', ''))
  })

  public readonly domainDistribution = computed((): DomainBar[] => {
    const tags  = this.userInterestTags.value
    const total = tags.length || 1
    return DOMAIN_META.map(d => {
      const count = tags.filter(t => (INTEREST_CATEGORIES[d.key] as readonly string[]).includes(t)).length
      return { label: d.label, icon: d.icon, color: d.color, count, pct: Math.round((count / total) * 100) }
    })
  })

  public readonly personaBadgeClass = computed((): string => {
    const p = this.userPersona.value
    if (p.includes('Tech'))     return 'badge-orange'
    if (p.includes('Sports'))   return 'badge-cyan'
    if (p.includes('Creative')) return 'badge-pink'
    return 'badge-green'
  })

  public readonly previewPersona = computed((): string =>
    this.regForm.selectedInterests.length === 0 ? '待生成画像...' : this.computePersona(this.regForm.selectedInterests)
  )

  public readonly previewPersonaClass = computed((): string => {
    const p = this.previewPersona.value
    if (p.includes('Tech'))     return 'text-orange'
    if (p.includes('Sports'))   return 'text-cyan'
    if (p.includes('Creative')) return 'text-pink'
    return 'text-green'
  })

  public toggleInterestTag(interest: string): void {
    const idx = this.regForm.selectedInterests.indexOf(interest)
    if (idx > -1) this.regForm.selectedInterests.splice(idx, 1)
    else          this.regForm.selectedInterests.push(interest)
  }

  public submitRegistration(): void {
    const name = this.regForm.name.trim()
    if (!name || this.regForm.selectedInterests.length === 0) return

    this.currentUser.value       = name
    this.currentUserRole.value   = 'student'
    this.currentUserAvatar.value = this.regForm.avatar
    this.userPersona.value       = this.computePersona(this.regForm.selectedInterests)

    localStorage.setItem('campus_buddy_user',      name)
    localStorage.setItem('campus_buddy_role',      'student')
    localStorage.setItem('campus_buddy_avatar',    this.regForm.avatar)
    localStorage.setItem('campus_buddy_persona',   this.userPersona.value)
    localStorage.setItem('campus_buddy_interests', JSON.stringify(this.regForm.selectedInterests))

    const sNode = graphService.nodeKey('student', name)
    for (const interest of this.regForm.selectedInterests) {
      graphService.addEdge(sNode, graphService.nodeKey('interest', interest))
    }
    graphService.updateStats()
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  public async submitAdminLogin(password: string): Promise<boolean> {
    const hash = await this.hashPassword(password.trim())
    if (hash !== '3c6a6ef3ab28ad049ea0e4c091d249d6ffe4f8ef69b645a5e855d243980fa877') return false

    this.currentUser.value       = '系统管理员'
    this.currentUserRole.value   = 'admin'
    this.currentUserAvatar.value = '🤖'
    this.userPersona.value       = '系统管理员 (System Admin)'

    localStorage.setItem('campus_buddy_user',      '系统管理员')
    localStorage.setItem('campus_buddy_role',      'admin')
    localStorage.setItem('campus_buddy_avatar',    '🤖')
    localStorage.setItem('campus_buddy_persona',   this.userPersona.value)
    localStorage.setItem('campus_buddy_interests', JSON.stringify([]))

    graphService.updateStats()
    return true
  }

  public restoreSession(): void {
    const savedUser = localStorage.getItem('campus_buddy_user')
    if (!savedUser) return

    this.currentUser.value       = savedUser
    this.currentUserRole.value   = (localStorage.getItem('campus_buddy_role') as 'student' | 'admin') ?? 'student'
    this.currentUserAvatar.value = localStorage.getItem('campus_buddy_avatar') ?? '🧭'
    this.userPersona.value       = localStorage.getItem('campus_buddy_persona') ?? '普通同学'

    const savedInterests: string[] = JSON.parse(localStorage.getItem('campus_buddy_interests') ?? '[]')
    const sNode = graphService.nodeKey('student', savedUser)
    for (const interest of savedInterests) {
      graphService.addEdge(sNode, graphService.nodeKey('interest', interest))
    }

    const savedSignups: string[] = JSON.parse(localStorage.getItem('campus_buddy_signups') ?? '[]')
    this.signedUpActivities.value = savedSignups
    for (const act of savedSignups) {
      graphService.addEdge(sNode, graphService.nodeKey('activity', act))
    }
  }

  public async logout(): Promise<void> {
    localStorage.clear()
    this.currentUser.value        = null
    this.currentUserRole.value    = null
    this.currentUserAvatar.value  = AVATAR_OPTIONS[0]
    this.userPersona.value        = '未知'
    this.signedUpActivities.value = []
    this.regForm.selectedInterests = []
    this.regForm.name   = ''
    this.regForm.avatar = AVATAR_OPTIONS[0]
    graphService.graph.value.clear()
    await graphService.loadGraphData()
  }

  public signUpForActivity(activity: string): void {
    if (!this.currentUser.value) return
    const sNode = graphService.nodeKey('student', this.currentUser.value)
    graphService.addEdge(sNode, graphService.nodeKey('activity', activity))
    if (!this.signedUpActivities.value.includes(activity)) {
      this.signedUpActivities.value.push(activity)
      localStorage.setItem('campus_buddy_signups', JSON.stringify(this.signedUpActivities.value))
    }
    graphService.updateStats()
  }

  public isSignedUp(activity: string): boolean {
    return this.signedUpActivities.value.includes(activity)
  }
}

export const authService = AuthService.getInstance()
