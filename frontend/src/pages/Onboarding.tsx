import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

type Step = 'gender' | 'age' | 'body' | 'goal' | 'schedule';

const goals = [
  { value: 'fat_loss', label: '减脂瘦身', icon: '🔥' },
  { value: 'shaping', label: '塑形增肌', icon: '💪' },
  { value: 'diet', label: '改善饮食', icon: '🥗' },
  { value: 'habit', label: '建立运动习惯', icon: '🏃' },
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
        gender: data.gender,
        age: Number(data.age),
        height: Number(data.height),
        current_weight: Number(data.current_weight),
        target_weight: Number(data.target_weight),
        goal: data.goal,
        days_per_week: Number(data.days_per_week),
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
    <div className="min-h-screen bg-background px-6 pt-12 pb-8 flex flex-col">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        <div className="h-1.5 bg-border rounded-full mb-8">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {step === 'gender' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold mb-2">你的性别是？</h1>
            <p className="text-sm text-muted mb-8">用于生成更适合你的训练计划</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'male', label: '男', icon: '👨' },
                { value: 'female', label: '女', icon: '👩' },
              ].map(g => (
                <button
                  key={g.value}
                  onClick={() => { update('gender', g.value); setStep('age'); }}
                  className={`p-6 rounded-2xl border-2 text-center transition-all ${
                    data.gender === g.value ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="text-4xl mb-2">{g.icon}</div>
                  <div className="font-medium">{g.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'age' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold mb-2">你的年龄？</h1>
            <p className="text-sm text-muted mb-8">帮助计算基础代谢</p>
            <input
              type="number"
              value={data.age}
              onChange={e => update('age', e.target.value)}
              className="w-full px-4 py-4 border border-border rounded-xl bg-card text-2xl text-center"
              placeholder="25"
              min={12}
              max={80}
              autoFocus
            />
            <div className="mt-auto pt-8">
              <button
                onClick={() => setStep('body')}
                disabled={!data.age}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
              >下一步</button>
            </div>
          </div>
        )}

        {step === 'body' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold mb-2">身体数据</h1>
            <p className="text-sm text-muted mb-8">用于计算每日热量目标</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-1 block">身高 (cm)</label>
                <input type="number" value={data.height} onChange={e => update('height', e.target.value)}
                  className="w-full px-4 py-3.5 border border-border rounded-xl bg-card text-base" placeholder="170" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">当前体重 (kg)</label>
                <input type="number" value={data.current_weight} onChange={e => update('current_weight', e.target.value)}
                  className="w-full px-4 py-3.5 border border-border rounded-xl bg-card text-base" placeholder="75" step="0.1" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">目标体重 (kg)</label>
                <input type="number" value={data.target_weight} onChange={e => update('target_weight', e.target.value)}
                  className="w-full px-4 py-3.5 border border-border rounded-xl bg-card text-base" placeholder="65" step="0.1" />
              </div>
            </div>
            <div className="mt-auto pt-8">
              <button
                onClick={() => setStep('goal')}
                disabled={!data.height || !data.current_weight || !data.target_weight}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
              >下一步</button>
            </div>
          </div>
        )}

        {step === 'goal' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold mb-2">你的主要目标？</h1>
            <p className="text-sm text-muted mb-8">AI教练会根据目标定制计划</p>
            <div className="space-y-3">
              {goals.map(g => (
                <button
                  key={g.value}
                  onClick={() => { update('goal', g.value); setStep('schedule'); }}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    data.goal === g.value ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold mb-2">运动安排</h1>
            <p className="text-sm text-muted mb-8">没有压力，后续可以随时调整</p>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">每周可运动几天？</label>
                <div className="flex gap-2">
                  {['2', '3', '4', '5', '6'].map(d => (
                    <button
                      key={d}
                      onClick={() => update('days_per_week', d)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                        data.days_per_week === d ? 'border-primary bg-primary text-white' : 'border-border bg-card'
                      }`}
                    >{d}天</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">每次可运动多久？</label>
                <div className="flex gap-2">
                  {['15', '30', '45', '60'].map(m => (
                    <button
                      key={m}
                      onClick={() => update('minutes_per_session', m)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                        data.minutes_per_session === m ? 'border-primary bg-primary text-white' : 'border-border bg-card'
                      }`}
                    >{m}分</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-auto pt-8">
              <button
                onClick={finish}
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
              >{loading ? 'AI正在生成计划...' : '生成我的减脂计划'}</button>
            </div>
          </div>
        )}

        {currentIndex > 0 && (
          <button
            onClick={() => setStep(steps[currentIndex - 1])}
            className="mt-4 text-sm text-muted text-center"
          >返回上一步</button>
        )}
      </div>
    </div>
  );
}
