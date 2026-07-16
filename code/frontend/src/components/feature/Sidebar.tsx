import { NavLink } from 'react-router-dom';
import type { FC } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  pendingReviewCount: number;
  knowledgeReviewCount: number;
}

const Sidebar: FC<SidebarProps> = ({ pendingReviewCount, knowledgeReviewCount }) => {
  const navItems: NavItem[] = [
    { path: '/', label: '工作台', icon: 'ri-dashboard-line' },
    { path: '/triage', label: '新建分析', icon: 'ri-add-circle-line' },
    { path: '/todo', label: '待办事项', icon: 'ri-todo-line', badge: pendingReviewCount },
    { path: '/review', label: '人工复核', icon: 'ri-shield-check-line' },
    { path: '/knowledge', label: '知识库', icon: 'ri-book-open-line', badge: knowledgeReviewCount },
    { path: '/history', label: '分析记录', icon: 'ri-archive-line' },
    { path: '/permissions', label: '权限管理', icon: 'ri-shield-user-line' },
  ];

  return (
    <aside className="w-[220px] min-w-[220px] h-screen flex flex-col border-r border-background-200/70 bg-background-50">
      {/* Logo Area */}
      <div className="px-5 py-5 border-b border-background-200/70">
        <NavLink to="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500">
            <i className="ri-sound-module-line text-base text-background-50"></i>
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-foreground-900 font-heading whitespace-nowrap">
              小聆
            </h1>
            <p className="text-[10px] text-foreground-500 font-body whitespace-nowrap">
              客户声音智能分析
            </p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap no-underline font-label ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-foreground-600 hover:bg-background-100 hover:text-foreground-800'
                  }`
                }
              >
                <span className="flex items-center justify-center w-5 h-5">
                  <i className={`${item.icon} text-base`}></i>
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent-500 text-[10px] font-semibold text-background-50">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="h-px bg-background-200/70 my-4 mx-2"></div>

        {/* Iteration */}
        <NavLink
          to="/evaluation"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap no-underline font-label ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-foreground-500 hover:bg-background-100 hover:text-foreground-700'
            }`
          }
        >
          <span className="flex items-center justify-center w-5 h-5">
            <i className="ri-loop-left-line text-base"></i>
          </span>
          <span>评估与迭代</span>
        </NavLink>
      </nav>

      {/* Bottom Status */}
      <div className="px-4 py-3 border-t border-background-200/70">
        <div className="flex items-center gap-2 text-[11px] text-foreground-500">
          <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
          <span className="font-body">模拟模式</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;