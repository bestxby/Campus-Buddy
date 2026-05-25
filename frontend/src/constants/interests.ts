/**
 * constants/interests.ts
 * Static data constants extracted from App.vue.
 * Keeping data separate from logic prevents accidental mutation and
 * makes it easy to extend the interest taxonomy.
 */

/** Available avatar emoji options for the registration form */
export const AVATAR_OPTIONS = ['🚀', '💻', '🎨', '🎮', '🧭', '🎧', '🧠'] as const

/**
 * Interest categories — 30 tags across 4 domains.
 * Mirrors the taxonomy used in generate_mock_data.py.
 */
export const INTEREST_CATEGORIES = {
  sports: ['篮球', '足球', '羽毛球', '网球', '游泳', '乒乓球', '排球'],
  arts:   ['摄影', '读书', '电影', '音乐', '绘画', '棋类', '桌游', '书法'],
  tech:   ['Python', 'Web开发', '机器学习', '算法竞赛', '网络安全', 'Linux', '硬件DIY', '物联网'],
  social: ['志愿服务', '英语角', '户外探索', '辩论社', '公益支教', '求职沙龙', '旅行搭子'],
} as const

export type InterestDomain = keyof typeof INTEREST_CATEGORIES

/** All interest tags flattened into a single array */
export const ALL_INTERESTS: string[] = Object.values(INTEREST_CATEGORIES).flat()

/** Domain metadata for the sidebar profile bar chart */
export const DOMAIN_META = [
  { key: 'sports' as InterestDomain, label: '运动', icon: '⚽', color: '#22d3ee' },
  { key: 'arts'   as InterestDomain, label: '艺术', icon: '🎨', color: '#f472b6' },
  { key: 'tech'   as InterestDomain, label: '科技', icon: '💻', color: '#ffb74d' },
  { key: 'social' as InterestDomain, label: '社交', icon: '🤝', color: '#34d399' },
] as const
