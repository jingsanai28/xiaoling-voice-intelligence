import { Outlet, NavLink, useLocation } from 'react-router-dom';

const subNavItems = [
  { path: '/knowledge', label: '知识概览', icon: 'ri-dashboard-line', end: true },
  { path: '/knowledge/spaces', label: '知识空间', icon: 'ri-stack-line' },
  { path: '/knowledge/retrieval-test', label: '检索测试', icon: 'ri-search-eye-line' },
  { path: '/knowledge/review', label: '发布审核', icon: 'ri-check-double-line' },
  { path: '/knowledge/usage', label: '使用记录', icon: 'ri-history-line' },
];

export default function KnowledgeLayout() {
  const location = useLocation();
  const isRetrievalTest = location.pathname.startsWith('/knowledge/retrieval-test');

  const getPageTitle = () => {
    if (location.pathname === '/knowledge') return '知识概览';
    if (location.pathname.startsWith('/knowledge/spaces')) return '知识空间';
    if (location.pathname.startsWith('/knowledge/document/')) return '文档详情';
    if (location.pathname.startsWith('/knowledge/retrieval-test')) return '检索测试';
    if (location.pathname.startsWith('/knowledge/review')) return '发布审核';
    if (location.pathname.startsWith('/knowledge/usage')) return '使用记录';
    return '知识库';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub Navigation */}
      <div className="px-6 py-2 border-b border-background-200/70 bg-background-50">
        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground-500 font-label mr-2">知识库</span>
          <i className="ri-arrow-right-s-line text-foreground-400 text-xs"></i>
          <span className="text-xs text-foreground-700 font-label">{getPageTitle()}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {subNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap no-underline font-label ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-foreground-500 hover:bg-background-100 hover:text-foreground-700'
                }`
              }
            >
              <i className={`${item.icon} text-[11px]`}></i>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 min-h-0 ${isRetrievalTest ? '' : 'overflow-y-auto bg-background-100'}`}>
        <Outlet />
      </div>
    </div>
  );
}