import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      await register(phone, password);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-80 bg-warm opacity-[0.06] rounded-b-[60px]" />
      <div className="absolute top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />

      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-warm flex items-center justify-center mx-auto mb-5 shadow-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark">创建账号</h1>
          <p className="text-[13px] text-muted font-medium mt-1.5">开始你的AI减脂之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="bg-red-50 text-red-500 text-[13px] font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted pl-1">手机号</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 premium-card rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
              placeholder="请输入手机号" required autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted pl-1">设置密码</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 premium-card rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
              placeholder="至少6位密码" required minLength={6}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted pl-1">确认密码</label>
            <input
              type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 premium-card rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
              placeholder="再次输入密码" required minLength={6}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-semibold disabled:opacity-50 shadow-glow active:scale-[0.98] transition-transform mt-2"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted mt-8 font-medium">
          已有账号？<Link to="/login" className="text-primary font-semibold">登录</Link>
        </p>

        <p className="text-center text-[11px] text-muted mt-10 leading-relaxed">
          注册即表示同意<a href="/terms.html" className="text-primary font-medium">《用户协议》</a>和<a href="/privacy.html" className="text-primary font-medium">《隐私政策》</a>
        </p>
      </div>
    </div>
  );
}
