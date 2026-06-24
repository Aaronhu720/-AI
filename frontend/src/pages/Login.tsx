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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔥</div>
          <h1 className="text-2xl font-bold text-primary">小燃AI</h1>
          <p className="text-sm text-muted mt-1">你的AI减脂教练</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 text-danger text-sm px-4 py-2.5 rounded-lg">{error}</div>
          )}

          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 border border-border rounded-xl bg-card text-base"
            placeholder="手机号"
            required
            autoFocus
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 border border-border rounded-xl bg-card text-base"
            placeholder="密码"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white rounded-xl text-base font-medium disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          还没有账号？<Link to="/register" className="text-primary font-medium">注册</Link>
        </p>

        <p className="text-center text-xs text-muted mt-8">
          登录即表示同意<a href="/terms.html" className="text-primary">《用户协议》</a>和<a href="/privacy.html" className="text-primary">《隐私政策》</a>
        </p>
      </div>
    </div>
  );
}
