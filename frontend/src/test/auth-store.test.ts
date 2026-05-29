import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useGraphStore } from '../stores/graph'
// @ts-ignore
import { webcrypto } from 'node:crypto'

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any
}

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()

    // Mock global fetch to prevent relative URL fetch warnings during logout/loadGraphData
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ students: [], activities: [], registrations: [] })
      } as Response)
    )
  })

  it('should initialize with default states', () => {
    const store = useAuthStore()
    expect(store.currentUser).toBeNull()
    expect(store.currentUserRole).toBeNull()
    expect(store.userPersona).toBe('未知')
  })

  it('should successfully login as admin with correct password', async () => {
    const store = useAuthStore()
    vi.spyOn(crypto.subtle, 'digest').mockImplementation(async (_algorithm, data) => {
      const decoded = new TextDecoder().decode(data as Uint8Array)
      if (decoded === 'mock_admin_password') {
        const targetHex = '3c6a6ef3ab28ad049ea0e4c091d249d6ffe4f8ef69b645a5e855d243980fa877'
        return new Uint8Array(targetHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))).buffer
      }
      return new Uint8Array(32).buffer
    })

    const success = await store.submitAdminLogin('mock_admin_password')
    expect(success).toBe(true)
    expect(store.currentUser).toBe('系统管理员')
    expect(store.currentUserRole).toBe('admin')
    expect(store.userPersona).toBe('系统管理员')
    expect(localStorage.getItem('campus_buddy_user')).toBe('系统管理员')
  })

  it('should fail admin login with wrong password', async () => {
    const store = useAuthStore()
    const success = await store.submitAdminLogin('wrongpass')
    expect(success).toBe(false)
    expect(store.currentUser).toBeNull()
  })

  it('should submit registration and save student details', () => {
    const store = useAuthStore()
    store.regForm.name = 'Alice'
    store.regForm.selectedInterests = ['Python']
    
    store.submitRegistration()

    expect(store.currentUser).toBe('Alice')
    expect(store.currentUserRole).toBe('student')
    expect(store.userPersona).toContain('科技极客') // Or Sports depending on categorization
    expect(localStorage.getItem('campus_buddy_user')).toBe('Alice')
  })

  it('should restore session from localStorage', () => {
    const graphStore = useGraphStore()
    graphStore.graph.set('student:Bob', new Set(['interest:足球']))

    localStorage.setItem('campus_buddy_user', 'Bob')
    localStorage.setItem('campus_buddy_role', 'student')
    localStorage.setItem('campus_buddy_persona', '运动健将')
    localStorage.setItem('campus_buddy_interests', JSON.stringify(['足球']))
    localStorage.setItem('campus_buddy_signups', JSON.stringify(['活动A']))

    const store = useAuthStore()
    store.restoreSession()

    expect(store.currentUser).toBe('Bob')
    expect(store.currentUserRole).toBe('student')
    expect(store.signedUpActivities).toContain('活动A')
  })

  it('should logout and clear states', async () => {
    const store = useAuthStore()
    store.regForm.name = 'Alice'
    store.regForm.selectedInterests = ['Python']
    store.submitRegistration()
    
    await store.logout()
    expect(store.currentUser).toBeNull()
    expect(store.currentUserRole).toBeNull()
    expect(store.signedUpActivities.length).toBe(0)
    expect(localStorage.getItem('campus_buddy_user')).toBeNull()
  })

  it('should handle signing up for and cancelling activities', () => {
    const store = useAuthStore()
    store.regForm.name = 'Alice'
    store.regForm.selectedInterests = ['Python']
    store.submitRegistration()

    store.signUpForActivity('周三篮球赛')
    expect(store.isSignedUp('周三篮球赛')).toBe(true)
    expect(store.signedUpActivities).toContain('周三篮球赛')

    store.cancelSignUpForActivity('周三篮球赛')
    expect(store.isSignedUp('周三篮球赛')).toBe(false)
    expect(store.signedUpActivities).not.toContain('周三篮球赛')
  })

  it('should restore student session only if the student exists in the graph', () => {
    const graphStore = useGraphStore()
    graphStore.graph.set('student:Bob', new Set(['interest:足球']))

    localStorage.setItem('campus_buddy_user', 'Bob')
    localStorage.setItem('campus_buddy_role', 'student')
    localStorage.setItem('campus_buddy_persona', '运动健将')
    localStorage.setItem('campus_buddy_interests', JSON.stringify(['足球']))
    localStorage.setItem('campus_buddy_signups', JSON.stringify([]))

    const store = useAuthStore()
    store.restoreSession()

    expect(store.currentUser).toBe('Bob')
    expect(store.currentUserRole).toBe('student')
  })

  it('should reject session restoration if student is missing from graph', () => {
    // Bob does not exist in graphStore.graph
    localStorage.setItem('campus_buddy_user', 'Bob')
    localStorage.setItem('campus_buddy_role', 'student')
    localStorage.setItem('campus_buddy_persona', '运动健将')
    localStorage.setItem('campus_buddy_interests', JSON.stringify(['足球']))
    localStorage.setItem('campus_buddy_signups', JSON.stringify([]))

    const store = useAuthStore()
    store.restoreSession()

    // Restoration fails and triggers a clean logout
    expect(store.currentUser).toBeNull()
    expect(localStorage.getItem('campus_buddy_user')).toBeNull()
  })

  it('should keep custom activities and custom interests on logout but clear session keys', async () => {
    localStorage.setItem('campus_buddy_custom_activities', JSON.stringify([{ name: '活动A', interests: ['Python'] }]))
    localStorage.setItem('campus_buddy_custom_interests', JSON.stringify([{ name: 'Python', domain: 'tech' }]))
    localStorage.setItem('campus_buddy_user', 'Bob')

    const store = useAuthStore()
    await store.logout()

    // Session user is cleared
    expect(store.currentUser).toBeNull()
    expect(localStorage.getItem('campus_buddy_user')).toBeNull()
    
    // Persistent graph items are preserved
    expect(localStorage.getItem('campus_buddy_custom_activities')).not.toBeNull()
    expect(localStorage.getItem('campus_buddy_custom_interests')).not.toBeNull()
  })

  it('should toggle privacy mode and social mode with mutual exclusion and update registry', () => {
    const store = useAuthStore()
    store.regForm.name = 'Bob'
    store.regForm.selectedInterests = ['足球']
    store.submitRegistration()

    // 1. Enable privacy mode
    store.togglePrivacyMode()
    expect(store.isPrivateMode).toBe(true)
    expect(localStorage.getItem('campus_buddy_private_mode')).toBe('true')

    // 2. Enable social mode (should disable privacy mode)
    store.toggleSocialMode()
    expect(store.isSocialMode).toBe(true)
    expect(store.isPrivateMode).toBe(false)
    expect(localStorage.getItem('campus_buddy_social_mode')).toBe('true')
    expect(localStorage.getItem('campus_buddy_private_mode')).toBe('false')

    // 3. Re-enable privacy mode (should disable social mode)
    store.togglePrivacyMode()
    expect(store.isPrivateMode).toBe(true)
    expect(store.isSocialMode).toBe(false)
    
    // Check registered student info reflects the updates
    const list = JSON.parse(localStorage.getItem('campus_buddy_registered_students') || '[]')
    const student = list.find((s: any) => s.name === 'Bob')
    expect(student).toBeDefined()
    expect(student.privateMode).toBe(true)
    expect(student.socialMode).toBe(false)
  })
})
