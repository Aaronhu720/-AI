import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">设置</h1>

      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {user?.gender === 'female' ? '👩' : '👨'}
        </div>
        <div>
          <p className="font-medium">{user?.nickname || '小燃用户'}</p>
          <p className="text-xs text-muted mt-0.5">{user?.phone}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {[
          { label: '个人资料', desc: '修改昵称、身体数据' },
          { label: '目标设置', desc: '调整减脂目标和计划' },
          { label: '提醒设置', desc: '称重、饮食、运动提醒' },
          { label: '会员中心', desc: user?.is_member ? '已开通会员' : '免费版' },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center justify-between p-4 text-left">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted mt-0.5">{item.desc}</p>
            </div>
            <span className="text-muted">→</span>
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        <a href="/privacy.html" className="flex items-center justify-between p-4">
          <span className="text-sm">隐私政策</span>
          <span className="text-muted text-xs">→</span>
        </a>
        <a href="/terms.html" className="flex items-center justify-between p-4">
          <span className="text-sm">用户协议</span>
          <span className="text-muted text-xs">→</span>
        </a>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm">版本</span>
          <span className="text-xs text-muted">1.0.0</span>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full py-3 border border-danger text-danger rounded-xl text-sm font-medium">
        退出登录
      </button>

      <p className="text-center text-[10px] text-muted">
        本App提供的内容仅用于健康生活方式参考，不构成医疗建议。如有疾病请咨询医生。
      </p>
    </div>
  );
}
