import { Outlet, NavLink } from 'react-router-dom';

const tabs = [
  { path: '/', label: '今日', icon: '☀' },
  { path: '/training', label: '训练', icon: '💪' },
  { path: '/diet', label: '饮食', icon: '🥗' },
  { path: '/trends', label: '趋势', icon: '📈' },
  { path: '/coach', label: 'AI教练', icon: '🤖' },
];

export default function Layout() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-[calc(var(--safe-top)+12px)]">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border pb-[var(--safe-bottom)]">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
