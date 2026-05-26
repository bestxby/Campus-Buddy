import { authService } from '@/services/AuthService'
import type { DomainBar, RegForm } from '@/types'

export const currentUser = authService.currentUser
export const currentUserRole = authService.currentUserRole
export const currentUserAvatar = authService.currentUserAvatar
export const userPersona = authService.userPersona
export const signedUpActivities = authService.signedUpActivities
export const regForm = authService.regForm

export const computePersona = (interests: string[]): string =>
  authService.computePersona(interests)

export const userInterestTags = authService.userInterestTags
export const domainDistribution = authService.domainDistribution
export const personaBadgeClass = authService.personaBadgeClass
export const previewPersona = authService.previewPersona
export const previewPersonaClass = authService.previewPersonaClass

export const toggleInterestTag = (interest: string): void => {
  authService.toggleInterestTag(interest)
}

export const submitRegistration = (): void => {
  authService.submitRegistration()
}

export const submitAdminLogin = async (password: string): Promise<boolean> =>
  await authService.submitAdminLogin(password)

export const restoreSession = (): void => {
  authService.restoreSession()
}

export const logout = async (): Promise<void> => {
  await authService.logout()
}

export const signUpForActivity = (activity: string): void => {
  authService.signUpForActivity(activity)
}

export const isSignedUp = (activity: string): boolean =>
  authService.isSignedUp(activity)
