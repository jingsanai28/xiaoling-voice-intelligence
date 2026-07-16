import type { DashboardStats } from '@/types/risk';

export const mockDashboardStats: DashboardStats = {
  todayTotalVoices: 1423,
  effectiveVoices: 647,
  highValueSignals: 8,
  pendingReview: 5,
  inProgress: 12,
  closedLoop: 23,
  teamDistribution: [
    { team: '品牌/公关', count: 4 },
    { team: '客服', count: 5 },
    { team: '运营/产品', count: 3 },
    { team: '法务', count: 1 },
  ],
  recentCorrections: [
    { caseId: 'CASE-2026-089', title: '支付失败投诉集中爆发', original: 'P2', corrected: 'P1', by: '张明' },
    { caseId: 'CASE-2026-092', title: '直播间诱导下单投诉', original: 'P1', corrected: 'P2', by: '李婷' },
  ],
  trends: [
    { keyword: '支付失败', count: 42, trend: 'up' },
    { keyword: '自动续费', count: 28, trend: 'up' },
    { keyword: '客服态度', count: 18, trend: 'stable' },
    { keyword: 'App闪退', count: 15, trend: 'down' },
    { keyword: '虚假宣传', count: 12, trend: 'up' },
  ],
};