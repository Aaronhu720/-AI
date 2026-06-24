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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔥</div>
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="text-sm text-muted mt-1">开始你的AI减脂之旅</p>
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
            placeholder="设置密码（至少6位）"
            required
            minLength={6}
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3.5 border border-border rounded-xl bg-card text-base"
            placeholder="确认密码"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white rounded-xl text-base font-medium disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          已有账号？<Link to="/login" className="text-primary font-medium">登录</Link>
        </p>

        <p className="text-center text-xs text-muted mt-8">
          注册即表示同意<a href="/terms.html" className="text-primary">《用户协议》</a>和<a href="/privacy.html" className="text-primary">《隐私政策》</a>
        </p>
      </div>
    </div>
  );
}
