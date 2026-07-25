import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { isNative, initIAP, getProduct, purchase, restorePurchases, onPurchaseApproved } from '@/lib/iap';

export default function MembershipPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNative()) {
      setReady(true);
      setPrice('¥12/月');
      return;
    }

    initIAP().then(() => {
      const product = getProduct();
      if (product?.pricing?.price) {
        setPrice(product.pricing.price);
      } else {
        setPrice('¥12/月');
      }
      setReady(true);

      onPurchaseApproved(async (receipt) => {
        try {
          await api.post('/user/verify-apple-receipt', { receipt_data: receipt });
          await refreshUser();
        } catch {}
      });
    });
  }, []);

  async function handlePurchase() {
    setError('');
    setLoading(true);
    try {
      if (isNative()) {
        const ok = await purchase();
        if (!ok) setError('购买未完成');
      } else {
        await api.post('/user/subscribe', { plan: 'monthly' });
        await refreshUser();
      }
    } catch {
      setError('购买失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setError('');
    setRestoring(true);
    try {
      await restorePurchases();
      await refreshUser();
    } catch {
      setError('恢复失败');
    } finally {
      setRestoring(false);
    }
  }

  const isMember = user?.is_member;

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold tracking-tight text-dark">会员中心</h1>
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white shadow-glow">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[15px] font-bold">小燃AI Pro</span>
          </div>
          <p className="text-[13px] opacity-90 mt-1">
            {isMember ? '您已是会员，享受全部功能' : '解锁全部高级功能'}
          </p>
        </div>
      </div>

      {!isMember && (
        <div className="premium-card rounded-3xl p-5 space-y-4">
          <div className="text-center">
            <p className="text-[28px] font-bold text-dark">{price || '...'}</p>
            <p className="text-[12px] text-muted mt-1">自动续订，可随时取消</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-[13px] font-medium px-4 py-3 rounded-2xl text-center">
              {error}
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={loading || !ready}
            className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-semibold disabled:opacity-50 shadow-glow active:scale-[0.98] transition-transform"
          >
            {loading ? '处理中...' : '立即订阅'}
          </button>

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full py-3 text-[13px] font-medium text-primary active:opacity-70"
          >
            {restoring ? '恢复中...' : '恢复已购买'}
          </button>
        </div>
      )}

      <div className="premium-card rounded-3xl p-5">
        <h3 className="text-[13px] font-semibold text-dark mb-4">
          {isMember ? '已解锁功能' : 'Pro 会员功能'}
        </h3>
        {[
          { icon: '📸', title: '无限拍照识食', desc: '拍照自动识别食物和营养成分' },
          { icon: '🤖', title: 'AI教练对话', desc: '智能减脂建议、饮食分析' },
          { icon: '📊', title: '跨数据分析', desc: '整合运动+饮食+体重综合建议' },
          { icon: '📅', title: '智能训练计划', desc: '根据目标自动生成多周计划' },
          { icon: '🔔', title: '主动提醒', desc: '智能推送饮水、运动、称重提醒' },
          { icon: '📋', title: '营养报告导出', desc: '导出每周/每月营养分析报告' },
        ].map(f => (
          <div key={f.title} className="flex items-center gap-3 py-3 border-b border-black/[0.03] last:border-0">
            <span className="text-[18px]">{f.icon}</span>
            <div>
              <p className="text-[13px] font-semibold text-dark">{f.title}</p>
              <p className="text-[11px] text-muted">{f.desc}</p>
            </div>
            {isMember ? (
              <span className="ml-auto text-[11px] text-green-600 font-semibold">已解锁</span>
            ) : (
              <svg className="ml-auto w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {!isMember && (
        <div className="px-2 space-y-2">
          <p className="text-[10px] text-muted leading-relaxed">
            订阅将通过您的 Apple ID 账户收取费用。订阅会在当前周期结束前24小时内自动续订，届时将向您的账户收取续订费用。您可以在 iPhone 的"设置"&gt;"Apple ID"&gt;"订阅"中管理或取消订阅。
          </p>
          <p className="text-[10px] text-muted leading-relaxed">
            <a href="/terms.html" className="text-primary">用户协议</a>
            {' · '}
            <a href="/privacy.html" className="text-primary">隐私政策</a>
          </p>
        </div>
      )}
    </div>
  );
}
