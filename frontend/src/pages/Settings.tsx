import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  {
    label: '个人资料', desc: '修改昵称、身体数据',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    color: 'text-blue-500', bg: 'bg-blue-50',
  },
  {
    label: '目标设置', desc: '调整减脂目标和计划',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    color: 'text-orange-500', bg: 'bg-orange-50',
  },
  {
    label: '提醒设置', desc: '称重、饮食、运动提醒',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    color: 'text-purple-500', bg: 'bg-purple-50',
  },
  {
    label: '会员中心', desc: '',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    color: 'text-amber-500', bg: 'bg-amber-50',
  },
];

const LINKS = [
  { label: '隐私政策', href: '/privacy.html' },
  { label: '用户协议', href: '/terms.html' },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const memberDesc = user?.is_member ? '已开通会员' : '免费版';

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <h1 className="text-[22px] font-bold tracking-tight text-dark">设置</h1>

      <div className="premium-card rounded-3xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-warm flex items-center justify-center shadow-glow-sm">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-dark">{user?.nickname || '小燃用户'}</p>
          <p className="text-[12px] text-muted font-medium mt-0.5">{user?.phone || '未登录'}</p>
        </div>
        <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="premium-card rounded-3xl overflow-hidden">
        {MENU_ITEMS.map((item, i) => (
          <button key={item.label}
            className={`w-full flex items-center gap-3.5 p-4 text-left active:bg-black/[0.02] transition-colors ${
              i < MENU_ITEMS.length - 1 ? 'border-b border-black/[0.04]' : ''
            }`}>
            <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-dark">{item.label}</p>
              <p className="text-[11px] text-muted font-medium mt-0.5">
                {item.label === '会员中心' ? memberDesc : item.desc}
              </p>
            </div>
            <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      <div className="premium-card rounded-3xl overflow-hidden">
        {LINKS.map((link, i) => (
          <a key={link.label} href={link.href}
            className={`flex items-center justify-between p-4 ${
              i < LINKS.length - 1 ? 'border-b border-black/[0.04]' : ''
            }`}>
            <span className="text-[13px] font-medium text-dark">{link.label}</span>
            <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
        <div className="flex items-center justify-between p-4 border-t border-black/[0.04]">
          <span className="text-[13px] font-medium text-dark">版本</span>
          <span className="text-[11px] text-muted font-medium">v1.0.0</span>
        </div>
      </div>

      <button onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-red-500 premium-card active:scale-[0.98] transition-transform">
        退出登录
      </button>

      <p className="text-center text-[10px] text-muted font-medium leading-relaxed px-4">
        本App提供的内容仅用于健康生活方式参考，不构成医疗建议。如有疾病请咨询医生。
      </p>
    </div>
  );
}
