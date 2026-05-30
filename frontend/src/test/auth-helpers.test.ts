import { describe, it, expect } from 'vitest'
import { NAME_VALIDATION_REGEX, computePersona, hashPassword } from '../utils/auth-helpers'

describe('Auth Helpers - NAME_VALIDATION_REGEX', () => {
  it('should accept valid student names (2-20 chars, Chinese/English, spaces, hyphens)', () => {
    expect(NAME_VALIDATION_REGEX.test('张三')).toBe(true)
    expect(NAME_VALIDATION_REGEX.test('Alice Smith')).toBe(true)
    expect(NAME_VALIDATION_REGEX.test('Jean-Pierre')).toBe(true)
    expect(NAME_VALIDATION_REGEX.test('李四-王五')).toBe(true)
  })

  it('should reject invalid names (too short/long, containing special characters or digits)', () => {
    expect(NAME_VALIDATION_REGEX.test('A')).toBe(false) // too short
    expect(NAME_VALIDATION_REGEX.test('a'.repeat(21))).toBe(false) // too long
    expect(NAME_VALIDATION_REGEX.test('Alice123')).toBe(false) // contains numbers
    expect(NAME_VALIDATION_REGEX.test('Bob@School')).toBe(false) // contains @
  })
})

describe('Auth Helpers - computePersona', () => {
  it('should return "社交达人" when no interests are selected', () => {
    expect(computePersona([])).toBe('社交达人')
  })

  it('should return "斜杠青年" when there is a tie between maximum categories', () => {
    // '足球' is sports, 'Python' is tech. Both count as 1.
    expect(computePersona(['足球', 'Python'])).toBe('斜杠青年')
  })

  it('should return corresponding domain persona when a single category is dominant', () => {
    // Tech dominant -> '科技极客'
    expect(computePersona(['Python'])).toBe('科技极客')
    expect(computePersona(['Python', 'JavaScript'])).toBe('科技极客')

    // Sports dominant -> '运动健将'
    expect(computePersona(['足球'])).toBe('运动健将')
    expect(computePersona(['足球', '篮球'])).toBe('运动健将')

    // Arts dominant -> '文艺青年'
    expect(computePersona(['摄影', '戏剧', '音乐'])).toBe('文艺青年')
  })
})

describe('Auth Helpers - hashPassword', () => {
  it('should correctly compute SHA-256 hex hash of password strings', async () => {
    // SHA-256 for 'admin': 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
    const adminHash = await hashPassword('admin')
    expect(adminHash).toBe('8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918')

    // SHA-256 for '123456': 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
    const numHash = await hashPassword('123456')
    expect(numHash).toBe('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92')

    // Empty string hash
    // SHA-256 for '': e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const emptyHash = await hashPassword('')
    expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })
})
