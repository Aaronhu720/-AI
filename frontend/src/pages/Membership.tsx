import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { isNative, initIAP, getProduct, purchase, restorePurchases, onPurchaseApproved, MONTHLY_ID, YEARLY_ID } from '@/lib/iap';

type Plan = 'monthly' | 'yearly';

export default function MembershipPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [monthlyPrice, setMonthlyPrice] = useState('¥12/月');
  const [yearlyPrice, setYearlyPrice] = useState('¥98/年');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNative()) {
      setReady(true);
      return;
    }

    initIAP().then(() => {
      const monthly = getProduct(MONTHLY_ID);
      const yearly = getProduct(YEARLY_ID);
      if (monthly?.pricing?.price) setMonthlyPrice(monthly.pricing.price);
      if (yearly?.pricing?.price) setYearlyPrice(yearly.pricing.price);
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
    const productId = selectedPlan === 'yearly' ? YEARLY_ID : MONTHLY_ID;
    try {
      if (isNative()) {
        const ok = await purchase(productId);
        if (!ok) setError('购买未完成');
      } else {
        await api.post('/user/subscribe', { plan: selectedPlan });
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
    <div className="space-y-4 pb-20 animate-fade-in">
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
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`flex-1 rounded-2xl p-4 text-left transition-all ${
                selectedPlan === 'monthly'
                  ? 'premium-card ring-2 ring-primary shadow-glow-sm'
                  : 'premium-card opacity-70'
              }`}
            >
              <p className="text-[11px] text-muted font-medium">月度订阅</p>
              <p className="text-[22px] font-bold text-dark mt-1">{monthlyPrice}</p>
              <p className="text-[11px] text-muted mt-1">按月自动续订</p>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`flex-1 rounded-2xl p-4 text-left relative transition-all ${
                selectedPlan === 'yearly'
                  ? 'premium-card ring-2 ring-primary shadow-glow-sm'
                  : 'premium-card opacity-70'
              }`}
            >
              <span className="absolute -top-2 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                省32%
              </span>
              <p className="text-[11px] text-muted font-medium">年度订阅</p>
              <p className="text-[22px] font-bold text-dark mt-1">{yearlyPrice}</p>
              <p className="text-[11px] text-muted mt-1">按年自动续订</p>
            </button>
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
            {loading ? '处理中...' : `立即订阅 · ${selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice}`}
          </button>

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full py-3 text-[13px] font-medium text-primary active:opacity-70"
          >
            {restoring ? '恢复中...' : '恢复已购买'}
          </button>

          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] text-muted/70 leading-relaxed">
              订阅将通过您的 Apple ID 账户收取费用。订阅会在当前周期结束前24小时内自动续订，届时将向您的账户收取续订费用。您可以在"设置"&gt;"Apple ID"&gt;"订阅"中管理或取消订阅。
            </p>
            <div className="flex justify-center gap-3">
              <a href="/terms.html" className="text-[11px] text-primary font-medium">用户协议</a>
              <span className="text-[11px] text-muted">·</span>
              <a href="/privacy.html" className="text-[11px] text-primary font-medium">隐私政策</a>
            </div>
          </div>
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

    </div>
  );
}
