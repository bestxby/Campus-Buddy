import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateHtmlReport, generateAdminHtmlReport, computeAdminDiagnosticData } from '../utils/reportGenerator'
import { useGraphStore } from '../stores/graph'
import { graphAnalyticsService } from '../services/GraphAnalyticsService'

describe('Report Generator HTML Escaping', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should escape dangerous characters in generateHtmlReport', () => {
    const mockGetSharedInterest = () => '<strong>html-interest</strong>'
    const html = generateHtmlReport(
      '<script>alert("xss")</script>',
      ['<tag>', 'normal'],
      ['<activity>'],
      [{ name: '<buddy>', jaccard: 0.5, sharedInterests: ['<shared>'] }],
      mockGetSharedInterest
    )

    // Check that user inputs are escaped
    expect(html).not.toContain('<script>alert("xss")</script>')
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(html).toContain('&lt;tag&gt;')
    expect(html).toContain('&lt;activity&gt;')
    expect(html).toContain('&lt;buddy&gt;')
    expect(html).toContain('&lt;shared&gt;')
  })

  it('should escape dangerous characters in generateAdminHtmlReport including paths', () => {
    const graphStore = useGraphStore()
    // Setup a graph containing dangerous names
    const maliciousName = '<script>alert("xss")</script>'
    graphStore.graph.set(`student:${maliciousName}`, new Set(['interest:足球']))
    graphStore.graph.set('interest:足球', new Set([`student:${maliciousName}`, 'student:Bob']))
    graphStore.graph.set('student:Bob', new Set(['interest:足球']))

    const mockGetSharedInterest = () => 'normal'
    const html = generateAdminHtmlReport(
      maliciousName,
      ['足球'],
      [],
      [],
      mockGetSharedInterest
    )

    // Check that user inputs in the report are escaped
    expect(html).not.toContain('<script>alert("xss")</script>')
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })
})

describe('computeAdminDiagnosticData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    graphAnalyticsService.bridgeStudents.value = []
  })

  it('should correctly calculate student degree, rank, and percentile', () => {
    const graphStore = useGraphStore()
    // Setup 17 students to check ranking and percentile behavior (>15)
    // S1 has degree 4 (highest rank)
    // S2 has degree 3
    // S3-S17 have degree 1
    graphStore.graph.set('student:S1', new Set(['interest:1', 'interest:2', 'interest:3', 'interest:4']))
    graphStore.graph.set('student:S2', new Set(['interest:1', 'interest:2', 'interest:3']))
    for (let i = 3; i <= 17; i++) {
      graphStore.graph.set(`student:S${i}`, new Set(['interest:1']))
    }

    const data = computeAdminDiagnosticData('S2', false)
    expect(data.studentDegree).toBe(3)
    expect(data.studentRank).toBe(2)
    // 17 students total. S2 is rank 2 (index 1). Percentile: (17 - 2) / 17 * 100 = 88.2%
    expect(data.studentPercentile).toBe('88.2')
  })

  it('should determine social roles correctly: Isolated (degree 0)', () => {
    const graphStore = useGraphStore()
    graphStore.graph.set('student:Isolated', new Set())

    const data = computeAdminDiagnosticData('Isolated', false)
    expect(data.socialRole).toBe('暂无网络连接 (可积极建连)')
    expect(data.socialRoleIcon).toBe('🚨')
    expect(data.diagnosisNote).toContain('尚未与其他同学建立边连接')
  })

  it('should determine social roles correctly: Active Hub (rank <= 15)', () => {
    const graphStore = useGraphStore()
    graphStore.graph.set('student:Hub', new Set(['interest:1']))

    const data = computeAdminDiagnosticData('Hub', false)
    expect(data.socialRole).toBe('校园社交达人 (活跃核心)')
    expect(data.socialRoleIcon).toBe('👑')
  })

  it('should determine social roles correctly: Bridge (isBridge is true, rank > 15)', () => {
    const graphStore = useGraphStore()
    // Setup 17 students so we can rank someone > 15
    for (let i = 1; i <= 17; i++) {
      graphStore.graph.set(`student:S${i}`, new Set(i === 17 ? ['interest:1'] : ['interest:1', 'interest:2']))
    }
    // S17 will have the lowest degree, ranking 17 (which is > 15)
    graphAnalyticsService.bridgeStudents.value = [{ name: 'S17', score: 2.5 }]

    const data = computeAdminDiagnosticData('S17', false)
    expect(data.socialRole).toBe('社群桥梁枢纽 (跨界联络人)')
    expect(data.socialRoleIcon).toBe('🌉')
  })

  it('should determine social roles correctly: Active Member (degree >= 6, rank > 15)', () => {
    const graphStore = useGraphStore()
    // Setup 20 students so rank can be > 15
    // S1-S15 have degree 7
    for (let i = 1; i <= 15; i++) {
      graphStore.graph.set(`student:S${i}`, new Set(['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7']))
    }
    // S16 has degree 6
    graphStore.graph.set('student:S16', new Set(['i1', 'i2', 'i3', 'i4', 'i5', 'i6']))
    // S17-S20 have degree 1
    for (let i = 17; i <= 20; i++) {
      graphStore.graph.set(`student:S${i}`, new Set(['i1']))
    }

    const data = computeAdminDiagnosticData('S16', false)
    expect(data.studentRank).toBe(16) // Rank 16 (>15)
    expect(data.studentDegree).toBe(6) // Degree 6
    expect(data.socialRole).toBe('活跃社交成员 (活动探索者)')
    expect(data.socialRoleIcon).toBe('🟢')
  })

  it('should determine social roles correctly: Normal Member (degree < 6, rank > 15, not bridge)', () => {
    const graphStore = useGraphStore()
    // Setup 20 students
    for (let i = 1; i <= 15; i++) {
      graphStore.graph.set(`student:S${i}`, new Set(['i1', 'i2', 'i3']))
    }
    // S16 has degree 2
    graphStore.graph.set('student:S16', new Set(['i1', 'i2']))
    for (let i = 17; i <= 20; i++) {
      graphStore.graph.set(`student:S${i}`, new Set(['i1']))
    }

    const data = computeAdminDiagnosticData('S16', false)
    expect(data.studentRank).toBe(16)
    expect(data.studentDegree).toBe(2)
    expect(data.socialRole).toBe('普通社交参与者')
    expect(data.socialRoleIcon).toBe('🟡')
  })

  it('should correctly calculate connected component size using BFS', () => {
    const graphStore = useGraphStore()
    // Component 1: S1 - interest:A - S2
    graphStore.graph.set('student:S1', new Set(['interest:A']))
    graphStore.graph.set('interest:A', new Set(['student:S1', 'student:S2']))
    graphStore.graph.set('student:S2', new Set(['interest:A']))

    // Component 2: S3 (isolated)
    graphStore.graph.set('student:S3', new Set())

    const dataS1 = computeAdminDiagnosticData('S1', false)
    expect(dataS1.componentSize).toBe(2) // S1 and S2
    expect(dataS1.compPct).toBe('66.7') // 2 out of 3 total students

    const dataS3 = computeAdminDiagnosticData('S3', false)
    expect(dataS3.componentSize).toBe(1) // Only S3 itself
    expect(dataS3.compPct).toBe('33.3')
  })

  it('should construct shortest path to social hub student (found, not found, or is hub itself)', () => {
    const graphStore = useGraphStore()
    // Hub student will be S1 (highest degree)
    graphStore.graph.set('student:S1', new Set(['interest:A', 'interest:B']))
    graphStore.graph.set('interest:A', new Set(['student:S1', 'student:S2']))
    graphStore.graph.set('student:S2', new Set(['interest:A', 'interest:C']))
    graphStore.graph.set('interest:C', new Set(['student:S2', 'student:S3']))
    graphStore.graph.set('student:S3', new Set(['interest:C']))

    // Isolated student
    graphStore.graph.set('student:Isolated', new Set())

    // 1. Student S1 is the hub itself
    const dataHub = computeAdminDiagnosticData('S1', false)
    expect(dataHub.hubPathStr).toContain('本身即为全校社交活跃度最高的核心达人')

    // 2. Path found from S3 to S1
    // Path: S3 -> interest:C -> S2 -> interest:A -> S1
    const dataS3 = computeAdminDiagnosticData('S3', false)
    expect(dataS3.hubPathStr).toContain('👤S3 ➔ 🎯C ➔ 👤S2 ➔ 🎯A ➔ 👤S1')

    // 3. Path not found from Isolated to S1
    const dataIsolated = computeAdminDiagnosticData('Isolated', false)
    expect(dataIsolated.hubPathStr).toContain('无法建立联系')
  })
})

