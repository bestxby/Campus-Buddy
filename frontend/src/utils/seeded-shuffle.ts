let currentSessionSeed = Math.floor(Math.random() * 1e9)

export function regenerateSessionSeed(): void {
  currentSessionSeed = Math.floor(Math.random() * 1e9)
}

/**
 * Unbiased Fisher-Yates Shuffle with Seeded Random for stability
 */
export function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  let seed = currentSessionSeed
  // A simple, fast LCG seeded random function to guarantee reproducible sampling
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 16), 2246822507)
    seed = Math.imul(seed ^ (seed >>> 13), 3266489909)
    return ((seed ^= seed >>> 16) >>> 0) / 4294967296
  }
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
