import { INTEREST_CATEGORIES } from '@/constants/interests'

/**
 * Regular expression for validating student names:
 * 2-20 characters, allowing Chinese characters, English letters, spaces, and hyphens.
 */
export const NAME_VALIDATION_REGEX = /^[\u4e00-\u9fa5a-zA-Z\s-]{2,20}$/

/**
 * Computes the student's persona based on their selected interests categories count.
 */
export function computePersona(interests: string[]): string {
  const counts = {
    sports: interests.filter(x => (INTEREST_CATEGORIES.sports as readonly string[]).includes(x)).length,
    tech:   interests.filter(x => (INTEREST_CATEGORIES.tech   as readonly string[]).includes(x)).length,
    arts:   interests.filter(x => (INTEREST_CATEGORIES.arts   as readonly string[]).includes(x)).length,
    social: interests.filter(x => (INTEREST_CATEGORIES.social as readonly string[]).includes(x)).length,
  }
  const max = Math.max(...Object.values(counts))
  if (max === 0) return '社交达人'

  // Find all categories matching the maximum count to check for ties
  const maxCategories = Object.keys(counts).filter(
    key => counts[key as keyof typeof counts] === max
  )

  if (maxCategories.length > 1) {
    return '斜杠青年'
  }

  const key = maxCategories[0]
  if (key === 'tech')   return '科技极客'
  if (key === 'sports') return '运动健将'
  if (key === 'arts')   return '文艺青年'
  return '社交达人'
}

/**
 * Computes SHA-256 hash of a password string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
