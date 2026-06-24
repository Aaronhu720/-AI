import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { mockToday } from '@/lib/mockData';

interface TodayData {
  day_count: number;
  streak: number;
  weight: number | null;
  weight_trend: number;
  target_weight: number;
  calories_consumed: number;
  calories_target: number;
  calories_burned: number;
  workout_minutes: number;
  water_cups: number;
  water_target: number;
  tasks: { id: string; title: string; type: string; completed: boolean; completed_at: string | null }[];
  ai_tip: string;
}

function RingProgress({ percent, size = 68, stroke = 5.5, color, children }: {
  percent: number; size?: number; stroke?: number; color: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percent, 100) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#grad-${color})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <defs>
          <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F06225" />
            <stop offset="100%" stopColor="#F5A623" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

const TASK_META: Record<string, { icon: JSX.Element; color: string }> = {
  diet: {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>,
    color: 'text-primary',
  },
  workout: {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    color: 'text-secondary',
  },
  water: {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.5-8-11a8 8 0 1116 0c0 3.5-4 7-8 11z" /></svg>,
    color: 'text-blue-500',
  },
  weight: {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 6l3 12h12l3-12M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
    color: 'text-amber-500',
  },
};

export default function TodayPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TodayData | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [waterLoading, setWaterLoading] = useState(false);

  const load = () => api.get<TodayData>('/today').then(setData).catch(() => {
    if (import.meta.env.DEV) setData(mockToday as TodayData);
  });

  useEffect(() => { load(); }, []);

  async function recordWeight() {
    if (!weightInput) return;
    await api.post('/weight', { weight: Number(weightInput) }).catch(() => {});
    setShowWeightInput(false);
    setWeightInput('');
    load();
  }

  async function toggleTask(taskId: string) {
    await api.post(`/tasks/${taskId}/toggle`).catch(() => {});
    if (import.meta.env.DEV && data) {
      setData({
        ...data,
        tasks: data.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed, completed_at: t.completed ? null : new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) } : t),
      });
    } else {
      load();
    }
  }

  async function addWater() {
    if (waterLoading) return;
    setWaterLoading(true);
    try {
      const res = await api.post<{ cups: number }>('/water');
      if (data) setData({ ...data, water_cups: res.cups });
    } catch {
      if (import.meta.env.DEV && data) setData({ ...data, water_cups: Math.min(data.water_cups + 1, data.water_target + 2) });
    }
    setWaterLoading(false);
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  };

  if (!data) return <div className="py-20 text-center text-muted animate-fade-in">加载中...</div>;

  const completedTasks = data.tasks.filter(t => t.completed).length;
  const calPercent = data.calories_target > 0 ? Math.round((data.calories_consumed / data.calories_target) * 100) : 0;
  const waterPercent = data.water_target > 0 ? Math.round((data.water_cups / data.water_target) * 100) : 0;
  const workoutPercent = data.workout_minutes > 0 ? Math.min(Math.round(data.workout_minutes / 30 * 100), 100) : 0;
  const goalDiff = data.weight && data.target_weight ? (data.weight - data.target_weight) : 0;
  const startWeight = data.weight ? data.weight + (data.weight - data.target_weight) * 0.5 : 0;
  const goalProgress = startWeight > data.target_weight
    ? Math.min(Math.round(((startWeight - (data.weight || startWeight)) / (startWeight - data.target_weight)) * 100), 100)
    : 0;

  return (
    <div className="space-y-3.5 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs text-muted font-medium tracking-wide uppercase">{greeting()}</p>
          <h1 className="text-[22px] font-bold tracking-tight mt-0.5">
            {user?.nickname || 'Aaron'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="w-10 h-10 rounded-2xl glass shadow-card flex items-center justify-center">
            <svg className="w-[18px] h-[18px] text-dark-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <Link to="/settings" className="w-10 h-10 rounded-2xl bg-warm shadow-glow-sm flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{(user?.nickname || 'A')[0]}</span>
          </Link>
        </div>
      </div>

      {/* Goal card — hero */}
      <div className="premium-card rounded-3xl p-5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
        <div className="flex items-start justify-between relative">
          <div className="flex-1">
            <p className="text-[11px] text-muted font-medium">
              减脂计划第 <span className="text-dark font-semibold">{data.day_count}</span> 天
            </p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[11px] text-muted-dark">距目标还差</span>
              <span className="text-[32px] font-extrabold tracking-tight leading-none text-warm">
                {goalDiff.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-primary">kg</span>
            </div>
            <p className="text-[11px] text-muted mt-2">
              {data.weight || '--'} kg → {data.target_weight} kg · 已完成 {goalProgress}%
            </p>
            <div className="mt-3 h-[6px] bg-black/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-warm rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(goalProgress, 3)}%` }}
              />
            </div>
          </div>
          {data.streak > 0 && (
            <div className="ml-5 flex flex-col items-center glass rounded-2xl px-4 py-3 shadow-card">
              <span className="text-[10px] text-muted font-medium">连续打卡</span>
              <span className="text-[28px] font-extrabold leading-tight text-warm">
                {data.streak}
              </span>
              <span className="text-[10px] text-muted">天</span>
            </div>
          )}
        </div>
      </div>

      {/* Three ring indicators */}
      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-dark">今日目标</h2>
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-warm text-white shadow-glow-sm">
            进行中
          </span>
        </div>
        <div className="flex justify-around">
          {[
            { pct: calPercent, color: 'orange', value: String(data.calories_consumed), label: '热量', unit: 'kcal' },
            { pct: waterPercent, color: 'blue', value: `${data.water_cups}/${data.water_target}`, label: '饮水', unit: '杯' },
            { pct: workoutPercent, color: 'green', value: String(data.workout_minutes), label: '运动', unit: '分钟' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center">
              <RingProgress percent={item.pct} color={item.color}>
                <span className="text-[13px] font-bold text-dark">{item.value}</span>
              </RingProgress>
              <span className="text-[11px] text-muted mt-2.5 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weight */}
      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 6l3 12h12l3-12M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">今日体重</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[22px] font-bold tracking-tight">{data.weight || '--'}</span>
                <span className="text-xs text-muted">kg</span>
                {data.weight_trend !== 0 && (
                  <span className={`text-xs font-semibold ml-1 px-1.5 py-0.5 rounded-md ${
                    data.weight_trend < 0 ? 'text-success bg-success/10' : 'text-red-500 bg-red-50'
                  }`}>
                    {data.weight_trend < 0 ? '↓' : '↑'}{Math.abs(data.weight_trend)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowWeightInput(true)}
            className="px-4 py-2.5 rounded-xl bg-warm text-white text-xs font-semibold shadow-glow-sm active:scale-95 transition-transform"
          >
            记录体重
          </button>
        </div>
      </div>

      {/* AI suggestion */}
      <div className="premium-card rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-primary/5 to-transparent rounded-full" />
        <div className="flex items-start gap-3.5 relative">
          <div className="w-10 h-10 rounded-2xl bg-warm flex items-center justify-center shrink-0 shadow-glow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-primary mb-1.5">AI 今日建议</p>
            <p className="text-[13px] text-dark-secondary leading-[1.7]">{data.ai_tip}</p>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-dark">今日任务</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-warm rounded-full transition-all duration-700"
                style={{ width: `${data.tasks.length > 0 ? (completedTasks / data.tasks.length) * 100 : 0}%` }} />
            </div>
            <span className="text-[11px] text-muted font-medium">{completedTasks}/{data.tasks.length}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          {data.tasks.map(task => {
            const meta = TASK_META[task.type] || TASK_META.diet;
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-center gap-3 py-3 px-2 rounded-2xl transition-all active:bg-black/[0.02] ${
                  task.completed ? 'opacity-50' : ''
                }`}
              >
                <div className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center text-[10px] shrink-0 transition-all ${
                  task.completed
                    ? 'bg-warm text-white shadow-glow-sm'
                    : 'border-[1.5px] border-gray-200'
                }`}>
                  {task.completed && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  task.type === 'workout' ? 'bg-emerald-50 text-emerald-500' :
                  task.type === 'water' ? 'bg-blue-50 text-blue-500' :
                  task.type === 'weight' ? 'bg-amber-50 text-amber-500' :
                  'bg-primary-light text-primary'
                }`}>
                  {meta.icon}
                </div>
                <span className={`flex-1 text-[13px] text-left font-medium ${task.completed ? 'line-through text-muted' : 'text-dark'}`}>
                  {task.title}
                </span>
                <span className="text-[11px] text-muted font-medium">
                  {task.completed_at || (task.type === 'water' ? '全天' : '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diet summary */}
      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-dark">今日饮食</h2>
          <div className="flex items-baseline gap-1">
            <span className={`text-[15px] font-bold ${calPercent > 90 ? 'text-red-500' : 'text-primary'}`}>
              {data.calories_consumed}
            </span>
            <span className="text-[11px] text-muted font-medium">/ {data.calories_target} kcal</span>
          </div>
        </div>

        <div className="space-y-1">
          {[
            { label: '早餐', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>, bg: 'bg-amber-50 text-amber-500', cal: Math.round(data.calories_consumed * 0.35) },
            { label: '午餐', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>, bg: 'bg-orange-50 text-orange-500', cal: Math.round(data.calories_consumed * 0.4) },
            { label: '晚餐', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>, bg: 'bg-indigo-50 text-indigo-500', cal: Math.round(data.calories_consumed * 0.25) },
          ].map(meal => (
            <Link
              key={meal.label}
              to="/diet"
              className="flex items-center justify-between py-3 px-2 rounded-2xl active:bg-black/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meal.bg}`}>
                  {meal.icon}
                </div>
                <span className="text-[13px] font-medium text-dark">{meal.label}</span>
              </div>
              {meal.cal > 0 ? (
                <span className="text-[13px] text-primary font-semibold">{meal.cal} kcal</span>
              ) : (
                <span className="text-[11px] text-muted font-medium px-3 py-1.5 glass rounded-lg">+ 记录</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Water tracking */}
      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.5-8-11a8 8 0 1116 0c0 3.5-4 7-8 11z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-dark">饮水追踪</span>
          </div>
          <span className="text-[11px] text-muted font-medium">{data.water_cups} / {data.water_target} 杯</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: data.water_target }, (_, i) => (
              <div key={i}
                className={`flex-1 h-8 rounded-xl transition-all duration-500 ${
                  i < data.water_cups
                    ? 'bg-gradient-to-t from-blue-500 to-blue-400 shadow-sm'
                    : 'bg-black/[0.03]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={addWater}
            className="w-10 h-10 rounded-2xl glass shadow-card flex items-center justify-center text-blue-500 active:scale-90 transition-transform shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {waterPercent >= 100 && (
          <div className="mt-3 text-center">
            <span className="text-[11px] text-blue-500 font-semibold bg-blue-50 px-3 py-1 rounded-full">
              今日饮水目标已达成
            </span>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/diet" className="premium-card rounded-3xl p-5 block">
          <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-dark">记录饮食</p>
          <p className="text-[11px] text-muted mt-1">
            {data.calories_consumed > 0 ? `已记录 ${data.calories_consumed} kcal` : '点击开始记录'}
          </p>
        </Link>
        <Link to="/training" className="premium-card rounded-3xl p-5 block">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-dark">开始训练</p>
          <p className="text-[11px] text-muted mt-1">
            {data.workout_minutes > 0 ? `已运动 ${data.workout_minutes} 分钟` : '选择课程开始'}
          </p>
        </Link>
      </div>

      {/* Weight input modal */}
      {showWeightInput && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-8"
          onClick={e => { if (e.target === e.currentTarget) setShowWeightInput(false); }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-float animate-slide-up">
            <h2 className="text-lg font-bold text-center mb-1 text-dark">记录今日体重</h2>
            <p className="text-[11px] text-muted text-center mb-5">建议每天同一时间、空腹测量</p>
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl text-2xl text-center font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder={data.weight ? String(data.weight) : '65.0'}
              step="0.1"
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowWeightInput(false)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold glass shadow-card text-dark-secondary">取消</button>
              <button onClick={recordWeight}
                className="flex-1 py-3.5 bg-warm text-white rounded-2xl text-sm font-bold shadow-glow">记录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
