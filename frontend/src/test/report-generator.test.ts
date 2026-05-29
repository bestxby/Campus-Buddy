import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateHtmlReport, generateAdminHtmlReport } from '../utils/reportGenerator'
import { useGraphStore } from '../stores/graph'

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
