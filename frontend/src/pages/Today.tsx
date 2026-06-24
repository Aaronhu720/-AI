import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

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

function CircleProgress({ percent, size = 80, stroke = 6, color = '#FF6B35' }: {
  percent: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percent, 100) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

export default function TodayPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TodayData | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [waterLoading, setWaterLoading] = useState(false);

  const load = () => api.get<TodayData>('/today').then(setData).catch(() => {});

  useEffect(() => { load(); }, []);

  async function recordWeight() {
    if (!weightInput) return;
    await api.post('/weight', { weight: Number(weightInput) });
    setShowWeightInput(false);
    setWeightInput('');
    load();
  }

  async function toggleTask(taskId: string) {
    await api.post(`/tasks/${taskId}/toggle`);
    load();
  }

  async function addWater() {
    if (waterLoading) return;
    setWaterLoading(true);
    try {
      const res = await api.post<{ cups: number }>('/water');
      if (data) setData({ ...data, water_cups: res.cups });
    } catch {}
    setWaterLoading(false);
  }

  async function removeWater() {
    if (waterLoading || !data || data.water_cups <= 0) return;
    setWaterLoading(true);
    try {
      const res = await api.delete<{ cups: number }>('/water');
      if (data) setData({ ...data, water_cups: res.cups });
    } catch {}
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

  if (!data) return <div className="py-20 text-center text-muted">加载中...</div>;

  const completedTasks = data.tasks.filter(t => t.completed).length;
  const taskPercent = data.tasks.length > 0 ? Math.round((completedTasks / data.tasks.length) * 100) : 0;
  const calPercent = data.calories_target > 0 ? Math.round((data.calories_consumed / data.calories_target) * 100) : 0;
  const waterPercent = data.water_target > 0 ? Math.round((data.water_cups / data.water_target) * 100) : 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {greeting()}，{user?.nickname || '小燃用户'}
          </h1>
          <p className="text-xs text-muted mt-1">
            减脂第 {data.day_count} 天
            {data.streak > 0 && <span className="ml-2 text-primary font-medium">🔥 连续{data.streak}天打卡</span>}
          </p>
        </div>
        <div className="relative">
          <CircleProgress percent={taskPercent} size={56} stroke={4} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{taskPercent}%</span>
          </div>
        </div>
      </div>

      {/* AI tip */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <p className="text-xs font-medium text-primary mb-0.5">AI 小燃</p>
            <p className="text-sm leading-relaxed">{data.ai_tip}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Weight */}
        <button
          onClick={() => setShowWeightInput(true)}
          className="bg-card rounded-xl border border-border p-3 text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-1">
            <span className="text-lg">⚖️</span>
            <span className="text-[10px] text-muted">体重</span>
          </div>
          <p className="text-xl font-bold mt-1">
            {data.weight ? data.weight : '--'}
            <span className="text-[10px] text-muted font-normal ml-0.5">kg</span>
          </p>
          {data.weight_trend !== 0 && (
            <p className={`text-[10px] font-medium ${data.weight_trend < 0 ? 'text-success' : 'text-red-400'}`}>
              {data.weight_trend > 0 ? '↑' : '↓'} {Math.abs(data.weight_trend)}kg
            </p>
          )}
          {data.weight_trend === 0 && <p className="text-[10px] text-muted">点击记录</p>}
        </button>

        {/* Calories */}
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-center gap-1">
            <span className="text-lg">🔥</span>
            <span className="text-[10px] text-muted">热量</span>
          </div>
          <p className="text-xl font-bold mt-1">
            {data.calories_consumed}
            <span className="text-[10px] text-muted font-normal ml-0.5">kcal</span>
          </p>
          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calPercent > 100 ? 'bg-red-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(calPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Workout */}
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-center gap-1">
            <span className="text-lg">💪</span>
            <span className="text-[10px] text-muted">运动</span>
          </div>
          <p className="text-xl font-bold mt-1">
            {data.workout_minutes}
            <span className="text-[10px] text-muted font-normal ml-0.5">分钟</span>
          </p>
          <p className="text-[10px] text-muted">
            {data.calories_burned > 0 ? `消耗${data.calories_burned}kcal` : '今日未运动'}
          </p>
        </div>
      </div>

      {/* Water tracking */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💧</span>
            <span className="text-sm font-medium">饮水追踪</span>
          </div>
          <span className="text-xs text-muted">{data.water_cups}/{data.water_target} 杯</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={removeWater}
            disabled={data.water_cups <= 0}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted disabled:opacity-30 active:scale-90 transition-transform"
          >
            <span className="text-lg leading-none">−</span>
          </button>
          <div className="flex-1">
            <div className="flex gap-1">
              {Array.from({ length: data.water_target }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-6 rounded transition-all duration-300 ${
                    i < data.water_cups ? 'bg-blue-400' : 'bg-gray-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addWater}
            className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 active:scale-90 transition-transform"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
        {waterPercent >= 100 && (
          <p className="text-xs text-blue-500 text-center mt-2 font-medium">今日饮水目标已达成！🎉</p>
        )}
      </div>

      {/* Net calories card */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-center">
            <p className="text-muted text-xs">摄入</p>
            <p className="font-bold text-primary">{data.calories_consumed}</p>
          </div>
          <span className="text-muted text-lg">−</span>
          <div className="text-center">
            <p className="text-muted text-xs">消耗</p>
            <p className="font-bold text-secondary">{data.calories_burned}</p>
          </div>
          <span className="text-muted text-lg">=</span>
          <div className="text-center">
            <p className="text-muted text-xs">净摄入</p>
            <p className={`font-bold ${
              (data.calories_consumed - data.calories_burned) <= data.calories_target
                ? 'text-success' : 'text-red-400'
            }`}>
              {data.calories_consumed - data.calories_burned}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted text-xs">目标</p>
            <p className="font-bold">{data.calories_target}</p>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold">今日任务</h2>
          <span className="text-xs text-muted">{completedTasks}/{data.tasks.length}</span>
        </div>
        <div className="space-y-2">
          {data.tasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-success/5 border-success/20'
                  : 'bg-card border-border active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                  task.completed ? 'bg-success border-success text-white' : 'border-gray-300'
                }`}>
                  {task.completed && '✓'}
                </div>
                <span className={`text-sm ${task.completed ? 'line-through text-muted' : 'font-medium'}`}>
                  {task.title}
                </span>
              </div>
              {task.completed_at && (
                <span className="text-[10px] text-muted">{task.completed_at}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/diet" className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 p-4 active:scale-[0.98] transition-transform">
          <span className="text-2xl">🍱</span>
          <p className="text-sm font-medium mt-2">记录饮食</p>
          <p className="text-[10px] text-muted mt-0.5">
            {data.calories_consumed > 0 ? `已记录${data.calories_consumed}kcal` : '点击开始记录'}
          </p>
        </Link>
        <Link to="/training" className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/10 p-4 active:scale-[0.98] transition-transform">
          <span className="text-2xl">🏋️</span>
          <p className="text-sm font-medium mt-2">开始训练</p>
          <p className="text-[10px] text-muted mt-0.5">
            {data.workout_minutes > 0 ? `已运动${data.workout_minutes}分钟` : '选择课程开始'}
          </p>
        </Link>
      </div>

      {/* Goal progress */}
      {data.weight && data.target_weight && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">目标进度</span>
            <span className="text-xs text-muted">
              {data.weight}kg → {data.target_weight}kg
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(Math.max(
                  (1 - (data.weight - data.target_weight) / (data.weight * 0.2)) * 100,
                  5
                ), 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-muted text-center mt-1.5">
            距离目标还差 {(data.weight - data.target_weight).toFixed(1)} kg，加油！
          </p>
        </div>
      )}

      {/* Weight input modal */}
      {showWeightInput && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-8"
          onClick={e => { if (e.target === e.currentTarget) setShowWeightInput(false); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-slide-up">
            <h2 className="text-lg font-bold text-center mb-1">记录今日体重</h2>
            <p className="text-xs text-muted text-center mb-4">建议每天同一时间、空腹测量</p>
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="w-full px-4 py-3.5 border border-border rounded-xl text-2xl text-center font-bold"
              placeholder={data.weight ? String(data.weight) : '65.0'}
              step="0.1"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowWeightInput(false)}
                className="flex-1 py-3 border border-border rounded-xl text-sm font-medium">取消</button>
              <button onClick={recordWeight}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold">记录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
