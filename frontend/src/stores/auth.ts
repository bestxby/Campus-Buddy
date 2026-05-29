import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useGraphStore } from './graph'
import { AVATAR_OPTIONS, INTEREST_CATEGORIES, DOMAIN_META, ADMIN_NAME } from '@/constants/interests'
import type { DomainBar, RegForm } from '@/types'
import { computePersona, hashPassword, NAME_VALIDATION_REGEX } from '@/utils/auth-helpers'

const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (e) {}
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Synchronously initialize state from safeStorage to prevent UI flashing (FOUC)
  const savedUser = safeStorage.getItem('campus_buddy_user')
  const savedRole = safeStorage.getItem('campus_buddy_role')
  
  const currentUser = ref<string | null>(savedUser)
  const currentUserRole = ref<'student' | 'admin' | null>(
    (savedRole === 'admin' || savedRole === 'student') ? savedRole : null
  )
  const currentUserAvatar = ref<string>(safeStorage.getItem('campus_buddy_avatar') ?? AVATAR_OPTIONS[0])
  const userPersona = ref<string>(safeStorage.getItem('campus_buddy_persona') ?? '未知')

  let initialSignups: string[] = []
  try {
    const rawSignups = safeStorage.getItem('campus_buddy_signups')
    if (rawSignups) {
      initialSignups = JSON.parse(rawSignups)
      if (!Array.isArray(initialSignups)) initialSignups = []
    }
  } catch (e) {}
  
  const signedUpActivities = ref<string[]>(initialSignups)
  const isPrivateMode = ref<boolean>(safeStorage.getItem('campus_buddy_private_mode') === 'true')
  const isSocialMode = ref<boolean>(safeStorage.getItem('campus_buddy_social_mode') === 'true')


  function togglePrivacyMode(): void {
    isPrivateMode.value = !isPrivateMode.value
    safeStorage.setItem('campus_buddy_private_mode', isPrivateMode.value ? 'true' : 'false')
    
    if (isPrivateMode.value && isSocialMode.value) {
      isSocialMode.value = false
      safeStorage.setItem('campus_buddy_social_mode', 'false')
      const graphStore = useGraphStore()
      if (currentUser.value) {
        graphStore.setStudentSocial(currentUser.value, false)
      }
    }

    const graphStore = useGraphStore()
    if (currentUser.value) {
      graphStore.setStudentPrivacy(currentUser.value, isPrivateMode.value)
    }

    // Sync to registered students
    if (currentUser.value) {
      try {
        const list = JSON.parse(safeStorage.getItem('campus_buddy_registered_students') || '[]')
        const student = list.find((s: any) => s.name === currentUser.value)
        if (student) {
          student.privateMode = isPrivateMode.value
          student.socialMode = isSocialMode.value
          safeStorage.setItem('campus_buddy_registered_students', JSON.stringify(list))
        }
      } catch (e) {}
    }
  }

  function toggleSocialMode(): void {
    isSocialMode.value = !isSocialMode.value
    safeStorage.setItem('campus_buddy_social_mode', isSocialMode.value ? 'true' : 'false')

    if (isSocialMode.value && isPrivateMode.value) {
      isPrivateMode.value = false
      safeStorage.setItem('campus_buddy_private_mode', 'false')
      const graphStore = useGraphStore()
      if (currentUser.value) {
        graphStore.setStudentPrivacy(currentUser.value, false)
      }
    }

    const graphStore = useGraphStore()
    if (currentUser.value) {
      graphStore.setStudentSocial(currentUser.value, isSocialMode.value)
    }

    // Sync to registered students
    if (currentUser.value) {
      try {
        const list = JSON.parse(safeStorage.getItem('campus_buddy_registered_students') || '[]')
        const student = list.find((s: any) => s.name === currentUser.value)
        if (student) {
          student.privateMode = isPrivateMode.value
          student.socialMode = isSocialMode.value
          safeStorage.setItem('campus_buddy_registered_students', JSON.stringify(list))
        }
      } catch (e) {}
    }
  }

  const regForm = reactive<RegForm>({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    selectedInterests: [],
  })

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
    if (p.includes('科技'))     return 'badge-orange'
    if (p.includes('运动'))     return 'badge-cyan'
    if (p.includes('文艺'))     return 'badge-pink'
    return 'badge-green'
  })

  const previewPersona = computed((): string =>
    regForm.selectedInterests.length === 0 ? '待生成画像...' : computePersona(regForm.selectedInterests)
  )

  const previewPersonaClass = computed((): string => {
    const p = previewPersona.value
    if (p.includes('科技'))     return 'text-orange'
    if (p.includes('运动'))     return 'text-cyan'
    if (p.includes('文艺'))     return 'text-pink'
    return 'text-green'
  })

  function toggleInterestTag(interest: string): void {
    const idx = regForm.selectedInterests.indexOf(interest)
    if (idx > -1) regForm.selectedInterests.splice(idx, 1)
    else          regForm.selectedInterests.push(interest)
  }

  function submitRegistration(): void {
    const name = regForm.name.trim()
    if (!name || !NAME_VALIDATION_REGEX.test(name) || regForm.selectedInterests.length === 0) return

    currentUser.value = name
    currentUserRole.value = 'student'
    currentUserAvatar.value = regForm.avatar
    userPersona.value = computePersona(regForm.selectedInterests)
    isPrivateMode.value = false
    isSocialMode.value = false

    safeStorage.setItem('campus_buddy_user',      name)
    safeStorage.setItem('campus_buddy_role',      'student')
    safeStorage.setItem('campus_buddy_avatar',    regForm.avatar)
    safeStorage.setItem('campus_buddy_persona',   userPersona.value)
    safeStorage.setItem('campus_buddy_interests', JSON.stringify(regForm.selectedInterests))
    safeStorage.setItem('campus_buddy_private_mode', 'false')
    safeStorage.setItem('campus_buddy_social_mode', 'false')

    // Persist the student profile info in campus_buddy_registered_students
    try {
      const list = JSON.parse(safeStorage.getItem('campus_buddy_registered_students') || '[]')
      const existingIdx = list.findIndex((s: any) => s.name === name)
      const sInfo = {
        name,
        avatar: regForm.avatar,
        interests: regForm.selectedInterests,
        signups: [] as string[],
        privateMode: false,
        socialMode: false
      }
      if (existingIdx > -1) {
        list[existingIdx] = sInfo
      } else {
        list.push(sInfo)
      }
      safeStorage.setItem('campus_buddy_registered_students', JSON.stringify(list))
    } catch (e) {}

    const graphStore = useGraphStore()
    const sNode = `student:${name}`
    for (const interest of regForm.selectedInterests) {
      graphStore.addEdge(sNode, `interest:${interest}`)
    }
    graphStore.updateStats()
  }

  async function submitAdminLogin(password: string): Promise<boolean> {
    const hash = await hashPassword(password.trim())
    if (hash !== '3c6a6ef3ab28ad049ea0e4c091d249d6ffe4f8ef69b645a5e855d243980fa877') return false

    currentUser.value = ADMIN_NAME
    currentUserRole.value = 'admin'
    currentUserAvatar.value = '🤖'
    userPersona.value = ADMIN_NAME

    safeStorage.setItem('campus_buddy_user',      ADMIN_NAME)
    safeStorage.setItem('campus_buddy_role',      'admin')
    safeStorage.setItem('campus_buddy_avatar',    '🤖')
    safeStorage.setItem('campus_buddy_persona',   userPersona.value)
    safeStorage.setItem('campus_buddy_interests', JSON.stringify([]))

    const graphStore = useGraphStore()
    graphStore.updateStats()
    return true
  }

  function restoreSession(): void {
    const savedUser = safeStorage.getItem('campus_buddy_user')
    if (!savedUser) return

    const savedRole = safeStorage.getItem('campus_buddy_role')
    const graphStore = useGraphStore()
    const sNode = `student:${savedUser}`

    // Verify student exists in the graph to prevent restoring invalid/orphaned sessions
    if (savedRole === 'student' && !graphStore.graph.has(sNode)) {
      console.warn(`[AuthStore] Session student "${savedUser}" not found in graph, resetting session.`)
      logout()
      return
    }

    currentUser.value = savedUser
    currentUserRole.value = (savedRole === 'admin' || savedRole === 'student') ? savedRole : 'student'
    currentUserAvatar.value = safeStorage.getItem('campus_buddy_avatar') ?? '🧭'
    userPersona.value = safeStorage.getItem('campus_buddy_persona') ?? '普通同学'
    
    let savedInterests: string[] = []
    try {
      savedInterests = JSON.parse(safeStorage.getItem('campus_buddy_interests') ?? '[]')
      if (!Array.isArray(savedInterests)) savedInterests = []
    } catch (e) {
      console.warn('[AuthStore] Failed to parse saved interests from localStorage, falling back to empty list.', e)
    }

    for (const interest of savedInterests) {
      graphStore.addEdge(sNode, `interest:${interest}`)
    }

    let savedSignups: string[] = []
    try {
      savedSignups = JSON.parse(safeStorage.getItem('campus_buddy_signups') ?? '[]')
      if (!Array.isArray(savedSignups)) savedSignups = []
    } catch (e) {
      console.warn('[AuthStore] Failed to parse saved signups from localStorage, falling back to empty list.', e)
    }

    signedUpActivities.value = savedSignups
    for (const act of savedSignups) {
      graphStore.addEdge(sNode, `activity:${act}`)
    }

    isPrivateMode.value = safeStorage.getItem('campus_buddy_private_mode') === 'true'
    if (isPrivateMode.value) {
      graphStore.setStudentPrivacy(savedUser, true)
    }

    isSocialMode.value = safeStorage.getItem('campus_buddy_social_mode') === 'true'
    if (isSocialMode.value) {
      graphStore.setStudentSocial(savedUser, true)
    }
  }

  async function logout(): Promise<void> {
    try {
      const persistentKeys = [
        'campus_buddy_custom_activities',
        'campus_buddy_custom_interests',
        'campus_buddy_deleted_activities',
        'campus_buddy_registered_students'
      ]
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('campus_buddy_') && !persistentKeys.includes(key)) {
          localStorage.removeItem(key)
        }
      })
    } catch (e) {}
    currentUser.value = null
    currentUserRole.value = null
    currentUserAvatar.value = AVATAR_OPTIONS[0]
    userPersona.value = '未知'
    signedUpActivities.value = []
    isPrivateMode.value = false
    isSocialMode.value = false
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
      safeStorage.setItem('campus_buddy_signups', JSON.stringify(signedUpActivities.value))
      
      // Update persistent registered student signups list
      try {
        const list = JSON.parse(safeStorage.getItem('campus_buddy_registered_students') || '[]')
        const student = list.find((s: any) => s.name === currentUser.value)
        if (student && !student.signups.includes(activity)) {
          student.signups.push(activity)
          safeStorage.setItem('campus_buddy_registered_students', JSON.stringify(list))
        }
      } catch (e) {}
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
      safeStorage.setItem('campus_buddy_signups', JSON.stringify(signedUpActivities.value))

      // Update persistent registered student signups list
      try {
        const list = JSON.parse(safeStorage.getItem('campus_buddy_registered_students') || '[]')
        const student = list.find((s: any) => s.name === currentUser.value)
        if (student) {
          student.signups = student.signups.filter((a: string) => a !== activity)
          safeStorage.setItem('campus_buddy_registered_students', JSON.stringify(list))
        }
      } catch (e) {}
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
    isPrivateMode,
    togglePrivacyMode,
    isSocialMode,
    toggleSocialMode,
  }
})
