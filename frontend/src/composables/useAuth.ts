import { useAuthStore } from '@/stores/auth'
import { getActivePinia } from 'pinia'
import type { Ref } from 'vue'

export const currentUser = {
  __v_isRef: true,
  get value() { return useAuthStore().currentUser }
} as unknown as Ref<any>

let mockRole: 'student' | 'admin' | null = null

export const currentUserRole = {
  __v_isRef: true,
  get value(): 'student' | 'admin' | null {
    if (mockRole !== null) return mockRole
    if (!getActivePinia()) return null
    return useAuthStore().currentUserRole
  },
  set value(val: 'student' | 'admin' | null) {
    if (mockRole !== null) {
      mockRole = val
      return
    }
    if (getActivePinia()) {
      useAuthStore().currentUserRole = val
    }
  },
  setMockValue(val: 'student' | 'admin' | null) {
    mockRole = val
  }
} as unknown as Ref<'student' | 'admin' | null> & { setMockValue(val: 'student' | 'admin' | null): void }

export const currentUserAvatar = {
  __v_isRef: true,
  get value() { return useAuthStore().currentUserAvatar }
} as unknown as Ref<string>

export const userPersona = {
  __v_isRef: true,
  get value() { return useAuthStore().userPersona }
} as unknown as Ref<string>

export const signedUpActivities = {
  __v_isRef: true,
  get value() { return useAuthStore().signedUpActivities }
} as unknown as Ref<string[]>

export const regForm = {
  __v_isRef: true,
  get value() { return useAuthStore().regForm }
} as unknown as Ref<any>

export const computePersona = (interests: string[]): string =>
  useAuthStore().computePersona(interests)

export const userInterestTags = {
  __v_isRef: true,
  get value() { return useAuthStore().userInterestTags }
} as unknown as Ref<string[]>

export const domainDistribution = {
  __v_isRef: true,
  get value() { return useAuthStore().domainDistribution }
} as unknown as Ref<any>

export const personaBadgeClass = {
  __v_isRef: true,
  get value() { return useAuthStore().personaBadgeClass }
} as unknown as Ref<string>

export const previewPersona = {
  __v_isRef: true,
  get value() { return useAuthStore().previewPersona }
} as unknown as Ref<string>

export const previewPersonaClass = {
  __v_isRef: true,
  get value() { return useAuthStore().previewPersonaClass }
} as unknown as Ref<string>

export const toggleInterestTag = (interest: string): void => {
  useAuthStore().toggleInterestTag(interest)
}

export const submitRegistration = (): void => {
  useAuthStore().submitRegistration()
}

export const submitAdminLogin = async (password: string): Promise<boolean> =>
  await useAuthStore().submitAdminLogin(password)

export const restoreSession = (): void => {
  useAuthStore().restoreSession()
}

export const logout = async (shouldReset: boolean = false): Promise<void> => {
  await useAuthStore().logout(shouldReset)
}

export const signUpForActivity = (activity: string): void => {
  useAuthStore().signUpForActivity(activity)
}

export const cancelSignUpForActivity = (activity: string): void => {
  useAuthStore().cancelSignUpForActivity(activity)
}

export const isSignedUp = (activity: string): boolean =>
  useAuthStore().isSignedUp(activity)

export const isPrivateMode = {
  __v_isRef: true,
  get value() { return useAuthStore().isPrivateMode }
} as unknown as Ref<boolean>

export const togglePrivacyMode = (): void => {
  useAuthStore().togglePrivacyMode()
}

export const isSocialMode = {
  __v_isRef: true,
  get value() { return useAuthStore().isSocialMode }
} as unknown as Ref<boolean>

export const toggleSocialMode = (): void => {
  useAuthStore().toggleSocialMode()
}
