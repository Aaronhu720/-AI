import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-80 bg-warm opacity-[0.06] rounded-b-[60px]" />
      <div className="absolute top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-40 -left-20 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-warm flex items-center justify-center mx-auto mb-5 shadow-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warm">小燃AI</h1>
          <p className="text-[13px] text-muted font-medium mt-1.5">你的AI减脂教练</p>
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
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 premium-card rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
              placeholder="请输入手机号"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted pl-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 premium-card rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
              placeholder="请输入密码"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-semibold disabled:opacity-50 shadow-glow active:scale-[0.98] transition-transform mt-2"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted mt-8 font-medium">
          还没有账号？<Link to="/register" className="text-primary font-semibold">注册</Link>
        </p>

        <p className="text-center text-[11px] text-muted mt-10 leading-relaxed">
          登录即表示同意<a href="/terms.html" className="text-primary font-medium">《用户协议》</a>和<a href="/privacy.html" className="text-primary font-medium">《隐私政策》</a>
        </p>
      </div>
    </div>
  );
}
