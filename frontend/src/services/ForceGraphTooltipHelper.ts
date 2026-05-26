import { nodeKey } from '@/composables/useGraph'
import type { HoveredConnectionDetail, NodeKind } from '@/types'

export class ForceGraphTooltipHelper {
  public static getTooltipDetails(
    node: { id: string; type: NodeKind; name: string },
    activeStudent: string,
    currentUser: string | null,
    graph: Map<string, Set<string>>,
  ): HoveredConnectionDetail {
    const d = node
    const focal = nodeKey('student', activeStudent)
    if (d.type === 'student') {
      if (d.name === activeStudent) {
        return {
          title: `${d.name} (您)`,
          type: 'student',
          details: '当前推荐的起点中心节点。围绕着您的是您勾选的兴趣标签以及报名的校园活动。'
        }
      } else {
        const sInt = Array.from(graph.get(focal) ?? []).filter(i => i.startsWith('interest:'))
        const oInt = Array.from(graph.get(nodeKey('student', d.name)) ?? []).filter(i => i.startsWith('interest:'))
        const oIntS = new Set(oInt)
        const sActs = Array.from(graph.get(focal) ?? []).filter(i => i.startsWith('activity:'))
        const oActs = new Set(Array.from(graph.get(nodeKey('student', d.name)) ?? []).filter(i => i.startsWith('activity:')))
        const shared = sInt.filter(x => oIntS.has(x)).map(x => x.replace('interest:', ''))
        const sharedActs = sActs.filter(x => oActs.has(x)).map(x => x.replace('activity:', ''))
        let details = `【活动搭子】您与 ${d.name} 共同关注的兴趣：${shared.join('、') || '暂无'}。`
        details += sharedActs.length > 0 ? ` 你们都报名了相同的活动：${sharedActs.join('、')}。` : ` 匹配度较高，不妨约他一起报名下方的推荐活动吧！`
        return { title: d.name, type: 'student', details }
      }
    } else if (d.type === 'activity') {
      const sInt = Array.from(graph.get(focal) ?? []).filter(i => i.startsWith('interest:'))
      const aInt = Array.from(graph.get(nodeKey('activity', d.name)) ?? []).filter(i => i.startsWith('interest:'))
      const aIntS = new Set(aInt)
      const shared = sInt.filter(x => aIntS.has(x)).map(x => x.replace('interest:', ''))
      const hasReg = graph.get(focal)?.has(nodeKey('activity', d.name))
      const isSelf = activeStudent === currentUser
      let details = hasReg
        ? `【已报名活动】${isSelf ? '您' : activeStudent}已成功报名此活动，在图上以绿色虚线直接连接。`
        : isSelf
          ? `【活动推荐】基于您的兴趣「${shared.join('、')}」向您匹配推荐。您尚未报名该活动，一键报名后可在图中建立绿色连接！`
          : `【活动推荐】基于该同学的兴趣「${shared.join('、')}」向其匹配推荐。目前尚未报名该活动。`
      return { title: d.name, type: 'activity', details }
    } else {
      return {
        title: `🎯 兴趣圈：${d.name}`,
        type: 'interest',
        details: `连接您与匹配学生/活动的桥梁纽带节点。通过该兴趣标签进行社交推荐。`
      }
    }
  }
}
