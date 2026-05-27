import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
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

  it('should successfully login as admin with correct SHA-256 password hash', async () => {
    const store = useAuthStore()
    const success = await store.submitAdminLogin('bestxby') // Correct admin password hash trigger
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
})
