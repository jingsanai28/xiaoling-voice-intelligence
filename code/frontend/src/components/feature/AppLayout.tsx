import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/feature/Sidebar';
import { mockDashboardStats } from '@/mocks/dashboard';
import { mockOverviewStats } from '@/mocks/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const location = useLocation();
  const [knowledgeReviewCount, setKnowledgeReviewCount] = useState(mockOverviewStats.pendingReviewCount);

  useEffect(() => {
    knowledgeApi.overview().then((stats) => setKnowledgeReviewCount(stats.pendingReviewCount)).catch(() => undefined);
  }, [location.pathname]);

  const isKnowledgePage = location.pathname.startsWith('/knowledge');
  const isRetrievalTestPage = location.pathname.startsWith('/knowledge/retrieval-test');

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return '客户声音工作台';
      case '/triage': return '新建分析';
      case '/todo': return '待办事项';
      case '/history': return '分析记录';
      case '/review': return '人工复核';
      case '/permissions': return '权限管理';
      case '/knowledge': return '知识概览';
      default:
        if (location.pathname.startsWith('/triage/')) return '信号详情';
        if (location.pathname.startsWith('/evaluation')) return '评估与迭代';
        if (location.pathname.startsWith('/knowledge/spaces')) return '知识空间';
        if (location.pathname.startsWith('/knowledge/document/')) return '文档详情';
        if (location.pathname.startsWith('/knowledge/retrieval-test')) return '检索测试';
        if (location.pathname.startsWith('/knowledge/review')) return '发布审核';
        if (location.pathname.startsWith('/knowledge/usage')) return '使用记录';
        return '';
    }
  };

  return (
    <div className="flex h-screen min-w-[1024px] bg-background-50">
      <Sidebar
        pendingReviewCount={mockDashboardStats.pendingReview}
        knowledgeReviewCount={knowledgeReviewCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-background-200/70 bg-background-50">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-foreground-900 font-heading">
              {getPageTitle()}
            </h2>
            <nav className="flex items-center gap-1 text-xs text-foreground-500 font-body">
              <span>小聆</span>
              <i className="ri-arrow-right-s-line text-foreground-400"></i>
              <span className="text-foreground-700">{getPageTitle()}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
              <input
                type="text"
                placeholder="搜索信号、关键词、来源..."
                className="w-64 pl-9 pr-3 py-1.5 rounded-lg border border-background-200/70 bg-background-100 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-colors font-body"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground-500 font-body">
              <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center">
                <i className="ri-user-line text-secondary-600 text-xs"></i>
              </div>
              <span>管理员</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 ${isKnowledgePage ? 'min-h-0' : 'overflow-y-auto bg-background-100'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
