import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export const currentUser = computed(() => useAuthStore().currentUser)
export const currentUserRole = computed(() => useAuthStore().currentUserRole)
export const currentUserAvatar = computed(() => useAuthStore().currentUserAvatar)
export const userPersona = computed(() => useAuthStore().userPersona)
export const signedUpActivities = computed(() => useAuthStore().signedUpActivities)
export const regForm = computed(() => useAuthStore().regForm)

export const computePersona = (interests: string[]): string =>
  useAuthStore().computePersona(interests)

export const userInterestTags = computed(() => useAuthStore().userInterestTags)
export const domainDistribution = computed(() => useAuthStore().domainDistribution)
export const personaBadgeClass = computed(() => useAuthStore().personaBadgeClass)
export const previewPersona = computed(() => useAuthStore().previewPersona)
export const previewPersonaClass = computed(() => useAuthStore().previewPersonaClass)

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

export const logout = async (): Promise<void> => {
  await useAuthStore().logout()
}

export const signUpForActivity = (activity: string): void => {
  useAuthStore().signUpForActivity(activity)
}

export const cancelSignUpForActivity = (activity: string): void => {
  useAuthStore().cancelSignUpForActivity(activity)
}

export const isSignedUp = (activity: string): boolean =>
  useAuthStore().isSignedUp(activity)

export const isPrivateMode = computed(() => useAuthStore().isPrivateMode)
export const togglePrivacyMode = (): void => {
  useAuthStore().togglePrivacyMode()
}
