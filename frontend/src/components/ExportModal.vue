<template>
  <div v-if="visible" class="export-modal-overlay" @click.self="close">
    <div class="export-modal-card">
      <!-- Close button -->
      <button @click="close" class="close-export-btn" title="关闭" aria-label="关闭">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <!-- Header -->
      <div class="export-modal-header">
        <h3>
          <span class="export-header-glow" style="display: inline-flex; align-items: center; vertical-align: middle; margin-right: 4px;">
            <svg v-if="isAdminMode" class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <svg v-else class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </span>
          {{ isAdminMode ? '导出社交匹配与社交圈分析报告' : '导出个性化匹配与方向推荐报告' }}
        </h3>
        <p>{{ isAdminMode ? '包含全局网络中心度分析、社群归属占比、搭子推荐及连通分量指标分析' : '支持将您的专属画像、活动匹配路径、相似搭子及社区拓扑指标一键保存至本地' }}</p>
      </div>

      <!-- Options -->
      <div class="export-options-list">
        <!-- MD -->
        <div class="export-option-card opt-md" @click="exportMarkdown">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="10" y1="9" x2="8" y2="11"></line>
              <line x1="8" y1="11" x2="10" y2="13"></line>
              <line x1="14" y1="9" x2="16" y2="11"></line>
              <line x1="16" y1="11" x2="14" y2="13"></line>
              <line x1="12" y1="9" x2="12" y2="15"></line>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">Markdown 匹配报告 (.md)</span>
            <span class="export-option-desc">{{ isAdminMode ? '包含该生网络中心度分析、连通社群归属以及隐私关系链路径' : '便于导入 Obsidian 或 Notion 知识库，轻量纯文本' }}</span>
          </div>
        </div>

        <!-- HTML -->
        <div class="export-option-card opt-html" @click="exportHtml">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">离线 HTML 网页 (.html)</span>
            <span class="export-option-desc">{{ isAdminMode ? '集成全局网络拓扑对比、介数中心度统计及交互图谱' : '包含苹果风卡片式排版与色彩设计，支持双击离线浏览' }}</span>
          </div>
        </div>

        <!-- PDF -->
        <div class="export-option-card opt-pdf" @click="exportPdf">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">个性化 PDF 报告 (.pdf)</span>
            <span class="export-option-desc">{{ isAdminMode ? '高对比度双栏排版，集成社交圈定位与搭子推荐分析' : '高对比度分页排版，自动调起浏览器打印，完美输出为PDF文件' }}</span>
          </div>
        </div>

        <!-- PNG -->
        <div class="export-option-card opt-png" @click="exportPng">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03457 19.176 5.12257 19.264 5.16315 19.373C5.20373 19.482 5.19502 19.5992 5.17761 19.8337L5.07447 21.2185C5.03666 21.7251 5.48512 22.1242 5.98687 22.0468L7.49132 21.8148C7.68367 21.7852 7.77984 21.7704 7.87157 21.7951C7.9633 21.8197 8.04169 21.8812 8.19846 22.0042C9.35122 22.909 10.793 23.4357 12.3333 23.4357" />
              <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/>
              <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/>
              <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/>
              <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">个性化分享海报 (.png)</span>
            <span class="export-option-desc">{{ isAdminMode ? '生成高对比度分析海报，包含社交定位及关键路径分析' : '生成极具科技感的立体点云匹配海报，适合朋友圈及群分享' }}</span>
          </div>
        </div>
      </div>

      <!-- Temp Print Container for PDF -->
      <iframe ref="printIframeRef" class="hidden-print-iframe"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { currentUser, userInterestTags, userPersona } from '@/composables/useAuth'
import { recommendations } from '@/composables/useRecommendations'
import { useRecommendationStore } from '@/stores/recommendation'
import { useGraphStore } from '@/stores/graph'
import { computePersona } from '@/utils/auth-helpers'
import { 
  generateMarkdownReport, 
  generateHtmlReport, 
  generateAdminMarkdownReport, 
  generateAdminHtmlReport 
} from '@/utils/reportGenerator'
import { drawAndDownloadPng } from '@/utils/canvasPoster'

const props = defineProps<{
  visible: boolean
  isAdminMode?: boolean
  studentName?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const printIframeRef = ref<HTMLIFrameElement | null>(null)

const close = () => {
  emit('close')
}

// Helpers to get target student details dynamically
const getTargetStudentName = () => {
  return props.studentName || currentUser.value || ''
}

const getTargetStudentInterests = () => {
  if (props.isAdminMode && props.studentName) {
    const sNode = `student:${props.studentName}`
    try {
      const graphStore = useGraphStore()
      return Array.from(graphStore.graph.get(sNode) ?? [])
        .filter(n => n.startsWith('interest:'))
        .map(n => n.replace('interest:', ''))
    } catch (e) {
      return []
    }
  }
  return userInterestTags.value
}

const getTargetStudentPersona = () => {
  if (props.isAdminMode && props.studentName) {
    return computePersona(getTargetStudentInterests())
  }
  return userPersona.value || '校园探索者'
}

// Helper to bridge store method to report generator
const getSharedInterestCallback = (name: string, targetName: string, type: 'activity' | 'student') => {
  const recStore = useRecommendationStore()
  return recStore.getSharedInterest(name, targetName, type)
}

// ─── 1. Run Report Generators with Current State ───────────────────────────
const runMarkdownGeneration = () => {
  const name = getTargetStudentName()
  if (!name) return ''
  const interests = getTargetStudentInterests()
  const acts = recommendations.value.activities
  const buddiesList = recommendations.value.buddies.slice(0, 10)
  
  if (props.isAdminMode) {
    return generateAdminMarkdownReport(name, interests, acts, buddiesList, getSharedInterestCallback)
  }
  return generateMarkdownReport(name, interests, acts, buddiesList, getSharedInterestCallback)
}

const runHtmlGeneration = () => {
  const name = getTargetStudentName()
  if (!name) return ''
  const interests = getTargetStudentInterests()
  const acts = recommendations.value.activities
  const buddiesList = recommendations.value.buddies.slice(0, 10)
  
  if (props.isAdminMode) {
    return generateAdminHtmlReport(name, interests, acts, buddiesList, getSharedInterestCallback)
  }
  return generateHtmlReport(name, interests, acts, buddiesList, getSharedInterestCallback)
}

// ─── 2. Export Actions ──────────────────────────────────────────────────────
const exportMarkdown = () => {
  const content = runMarkdownGeneration()
  if (!content) return
  // Prepend UTF-8 BOM \ufeff to prevent gibberish on Windows
  const blob = new Blob(['\ufeff' + content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  const filename = props.isAdminMode 
    ? `${getTargetStudentName()}_社交匹配与社交圈分析报告.md`
    : `${getTargetStudentName()}_校园活动搭子匹配推荐报告.md`
    
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportHtml = () => {
  const content = runHtmlGeneration()
  if (!content) return
  // Prepend UTF-8 BOM \ufeff to prevent gibberish on Windows
  const blob = new Blob(['\ufeff' + content], { type: 'text/html;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  const filename = props.isAdminMode 
    ? `${getTargetStudentName()}_社交匹配与社交圈分析报告.html`
    : `${getTargetStudentName()}_校园活动搭子匹配推荐报告.html`
    
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportPdf = () => {
  const name = getTargetStudentName()
  if (!name) return

  const iframe = printIframeRef.value
  if (!iframe) return

  const htmlContent = runHtmlGeneration()
  const primaryThemeColor = props.isAdminMode ? '#ffb74d' : '#0ea5e9'
  
  const printStyles = `
    <style>
      @media print {
        body {
          font-family: 'Outfit', 'Inter', 'Fira Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif !important;
          background-color: #f8fafc !important;
          color: #0f172a !important;
          padding: 0 !important;
          margin: 15mm 15mm !important;
        }
        .container {
          box-shadow: none !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .header {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-top: 4px solid ${primaryThemeColor} !important;
          border-radius: 12px !important;
          padding: 24px 30px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          margin-bottom: 24px !important;
        }
        .header h1 {
          color: #0f172a !important;
          font-size: 22px !important;
          font-weight: 800 !important;
          margin-bottom: 6px !important;
          margin-top: 0 !important;
        }
        .header p {
          color: #64748b !important;
          font-size: 13px !important;
        }
        .card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 24px 30px !important;
          margin-bottom: 24px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          page-break-inside: avoid !important;
        }
        .card h2 {
          font-size: 15px !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          padding-bottom: 10px !important;
          margin-top: 0 !important;
          margin-bottom: 15px !important;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tag {
          border: 1px solid #e2e8f0 !important;
          background-color: #f1f5f9 !important;
          color: #334155 !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          display: inline-block !important;
          margin-right: 8px !important;
          margin-bottom: 8px !important;
        }
        .activity-item {
          padding: 12px 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .activity-item:last-child {
          border-bottom: none !important;
        }
        .activity-name {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        .activity-path {
          background-color: #f8fafc !important;
          border-left: 3px solid #0ea5e9 !important;
          border-radius: 6px !important;
          color: #475569 !important;
          padding: 8px 12px !important;
          font-size: 11px !important;
          font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace !important;
          margin-top: 6px !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 10px !important;
        }
        th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 10px 12px !important;
          font-size: 12px !important;
        }
        td {
          padding: 10px 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 13px !important;
          color: #334155 !important;
        }
        .badge-percent {
          background-color: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
          color: #16a34a !important;
          padding: 2px 8px !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
        }
        .graph-hint {
          display: none !important;
        }
        #interactive-canvas {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
        }
        .diag-card {
          border-color: #ffb74d !important;
          background-color: #fffbeb !important;
        }
        .diag-card h2 {
          color: #b45309 !important;
          border-bottom: 1px solid #fde68a !important;
        }
        .diag-item-cell {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 5px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 10px 0 !important;
        }
        .diag-item-cell strong {
          color: #4b5563 !important;
          font-size: 13px !important;
        }
        .diag-item-cell span {
          color: #111827 !important;
          font-size: 13px !important;
          font-weight: 600 !important;
        }
        .diag-note-box, .diag-status-box {
          background-color: #fffdf5 !important;
          border: 1px solid #fde68a !important;
          color: #1f2937 !important;
        }
        .path-container {
          background-color: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          border-left: 4px solid #ffb74d !important;
          color: #1f2937 !important;
        }
      }
    </style>
  `
  
  const finalDoc = htmlContent
    .replace('<body>', '<body class="print-mode">')
    .replace('</head>', `${printStyles}</head>`)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write(finalDoc)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
  }, 250)
}

const exportPng = () => {
  const name = getTargetStudentName()
  if (!name) return

  const userInterests = getTargetStudentInterests()
  const acts = recommendations.value.activities
  const buddiesList = recommendations.value.buddies.slice(0, 10)
  const persona = getTargetStudentPersona()

  drawAndDownloadPng(
    name,
    userInterests,
    acts,
    buddiesList,
    persona,
    getSharedInterestCallback,
    props.isAdminMode
  )
}
</script>

<style scoped src="./ExportModal.css"></style>
