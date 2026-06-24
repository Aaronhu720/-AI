import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

type Step = 'gender' | 'age' | 'body' | 'goal' | 'schedule';

const goals = [
  {
    value: 'fat_loss', label: '减脂瘦身',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
    color: 'text-orange-500', bg: 'bg-orange-50',
  },
  {
    value: 'shaping', label: '塑形增肌',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    color: 'text-red-500', bg: 'bg-red-50',
  },
  {
    value: 'diet', label: '改善饮食',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    color: 'text-emerald-500', bg: 'bg-emerald-50',
  },
  {
    value: 'habit', label: '建立运动习惯',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    color: 'text-blue-500', bg: 'bg-blue-50',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('gender');
  const [data, setData] = useState({
    gender: '' as 'male' | 'female' | '',
    age: '',
    height: '',
    current_weight: '',
    target_weight: '',
    goal: '',
    days_per_week: '3',
    minutes_per_session: '30',
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  async function finish() {
    setLoading(true);
    try {
      await api.post('/user/onboarding', {
        gender: data.gender, age: Number(data.age), height: Number(data.height),
        current_weight: Number(data.current_weight), target_weight: Number(data.target_weight),
        goal: data.goal, days_per_week: Number(data.days_per_week),
        minutes_per_session: Number(data.minutes_per_session),
      });
      await refreshUser();
      navigate('/');
    } catch {
      setLoading(false);
    }
  }

  const steps: Step[] = ['gender', 'age', 'body', 'goal', 'schedule'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen px-6 pt-12 pb-8 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-60 bg-warm opacity-[0.05] rounded-b-[60px]" />

      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col relative">
        <div className="h-1.5 bg-black/[0.04] rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-warm rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {step === 'gender' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h1 className="text-[22px] font-bold text-dark mb-2">你的性别是？</h1>
            <p className="text-[13px] text-muted font-medium mb-8">用于生成更适合你的训练计划</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'male', label: '男',
                  icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                  color: 'text-blue-500', activeBg: 'bg-blue-50', activeRing: 'ring-blue-400' },
                { value: 'female', label: '女',
                  icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                  color: 'text-pink-500', activeBg: 'bg-pink-50', activeRing: 'ring-pink-400' },
              ].map(g => (
                <button
                  key={g.value}
                  onClick={() => { update('gender', g.value); setStep('age'); }}
                  className={`p-8 rounded-3xl text-center transition-all active:scale-95 ${
                    data.gender === g.value
                      ? `${g.activeBg} ring-2 ${g.activeRing}`
                      : 'premium-card'
                  }`}
                >
                  <div className={`${g.color} mx-auto mb-3`}>{g.icon}</div>
                  <div className="text-[15px] font-semibold text-dark">{g.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'age' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h1 className="text-[22px] font-bold text-dark mb-2">你的年龄？</h1>
            <p className="text-[13px] text-muted font-medium mb-8">帮助计算基础代谢</p>
            <input
              type="number" value={data.age} onChange={e => update('age', e.target.value)}
              className="w-full px-4 py-5 premium-card rounded-3xl text-3xl text-center font-bold text-dark outline-none focus:ring-2 focus:ring-primary/20 border-0"
              placeholder="25" min={12} max={80} autoFocus
            />
            <div className="mt-auto pt-8">
              <button onClick={() => setStep('body')} disabled={!data.age}
                className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-semibold disabled:opacity-40 shadow-glow active:scale-[0.98] transition-transform">
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 'body' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h1 className="text-[22px] font-bold text-dark mb-2">身体数据</h1>
            <p className="text-[13px] text-muted font-medium mb-8">用于计算每日热量目标</p>
            <div className="space-y-4">
              {[
                { label: '身高 (cm)', field: 'height', placeholder: '170' },
                { label: '当前体重 (kg)', field: 'current_weight', placeholder: '75' },
                { label: '目标体重 (kg)', field: 'target_weight', placeholder: '65' },
              ].map(item => (
                <div key={item.field} className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted pl-1">{item.label}</label>
                  <input
                    type="number"
                    value={data[item.field as keyof typeof data]}
                    onChange={e => update(item.field, e.target.value)}
                    className="w-full px-4 py-3.5 premium-card rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
                    placeholder={item.placeholder}
                    step={item.field.includes('weight') ? '0.1' : '1'}
                  />
                </div>
              ))}
            </div>
            <div className="mt-auto pt-8">
              <button onClick={() => setStep('goal')}
                disabled={!data.height || !data.current_weight || !data.target_weight}
                className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-semibold disabled:opacity-40 shadow-glow active:scale-[0.98] transition-transform">
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 'goal' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h1 className="text-[22px] font-bold text-dark mb-2">你的主要目标？</h1>
            <p className="text-[13px] text-muted font-medium mb-8">AI教练会根据目标定制计划</p>
            <div className="space-y-3">
              {goals.map(g => (
                <button
                  key={g.value}
                  onClick={() => { update('goal', g.value); setStep('schedule'); }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] ${
                    data.goal === g.value ? 'ring-2 ring-primary bg-primary-light' : 'premium-card'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${g.bg} ${g.color} flex items-center justify-center`}>
                    {g.icon}
                  </div>
                  <span className="text-[14px] font-semibold text-dark">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h1 className="text-[22px] font-bold text-dark mb-2">运动安排</h1>
            <p className="text-[13px] text-muted font-medium mb-8">没有压力，后续可以随时调整</p>
            <div className="space-y-8">
              <div>
                <label className="text-[13px] font-semibold text-dark mb-3 block">每周可运动几天？</label>
                <div className="flex gap-2">
                  {['2', '3', '4', '5', '6'].map(d => (
                    <button key={d} onClick={() => update('days_per_week', d)}
                      className={`flex-1 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-95 ${
                        data.days_per_week === d
                          ? 'bg-warm text-white shadow-glow-sm'
                          : 'premium-card text-dark'
                      }`}>
                      {d}天
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-dark mb-3 block">每次可运动多久？</label>
                <div className="flex gap-2">
                  {['15', '30', '45', '60'].map(m => (
                    <button key={m} onClick={() => update('minutes_per_session', m)}
                      className={`flex-1 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-95 ${
                        data.minutes_per_session === m
                          ? 'bg-warm text-white shadow-glow-sm'
                          : 'premium-card text-dark'
                      }`}>
                      {m}分
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-auto pt-8">
              <button onClick={finish} disabled={loading}
                className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-semibold disabled:opacity-40 shadow-glow active:scale-[0.98] transition-transform">
                {loading ? 'AI正在生成计划...' : '生成我的减脂计划'}
              </button>
            </div>
          </div>
        )}

        {currentIndex > 0 && (
          <button onClick={() => setStep(steps[currentIndex - 1])}
            className="mt-4 text-[13px] text-muted text-center font-medium flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回上一步
          </button>
        )}
      </div>
    </div>
  );
}
