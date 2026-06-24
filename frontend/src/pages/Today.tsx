import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

interface TodayData {
  day_count: number;
  weight: number | null;
  target_weight: number;
  calories_consumed: number;
  calories_target: number;
  water_ml: number;
  water_target: number;
  tasks: { id: string; title: string; type: string; completed: boolean }[];
  ai_tip: string;
}

export default function TodayPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TodayData | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);

  useEffect(() => {
    api.get<TodayData>('/today').then(setData).catch(() => {
      if (import.meta.env.DEV) {
        setData({
          day_count: 7,
          weight: 72.5,
          target_weight: 65,
          calories_consumed: 860,
          calories_target: 1800,
          water_ml: 1200,
          water_target: 2000,
          tasks: [
            { id: '1', title: '记录今日体重', type: 'weight', completed: true },
            { id: '2', title: '完成20分钟运动', type: 'exercise', completed: false },
            { id: '3', title: '记录三餐饮食', type: 'diet', completed: false },
            { id: '4', title: '喝够2000ml水', type: 'water', completed: false },
          ],
          ai_tip: '今天天气不错，建议饭后散步20分钟，有助于消化和减脂哦！💪',
        });
      }
    });
  }, []);

  async function recordWeight() {
    if (!weightInput) return;
    await api.post('/weight', { weight: Number(weightInput) });
    setShowWeightInput(false);
    const updated = await api.get<TodayData>('/today');
    setData(updated);
  }

  async function toggleTask(taskId: string) {
    await api.post(`/tasks/${taskId}/toggle`);
    const updated = await api.get<TodayData>('/today');
    setData(updated);
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

  const weightDiff = data.weight && data.target_weight
    ? (data.weight - data.target_weight).toFixed(1)
    : null;

  const completedTasks = data.tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl font-bold">
          {greeting()}，{user?.nickname || '小燃用户'}
        </h1>
        <p className="text-sm text-muted mt-1">
          减脂计划第 {data.day_count} 天
          {weightDiff && ` · 距离目标还差 ${weightDiff} kg`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setShowWeightInput(true)}
          className="bg-card rounded-xl border border-border p-3 text-center active:scale-95 transition-transform"
        >
          <div className="text-2xl font-bold text-primary">
            {data.weight ? `${data.weight}` : '--'}
          </div>
          <div className="text-[10px] text-muted mt-1">今日体重(kg)</div>
        </button>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-2xl font-bold text-secondary">
            {data.calories_consumed}<span className="text-sm text-muted">/{data.calories_target}</span>
          </div>
          <div className="text-[10px] text-muted mt-1">热量(kcal)</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">
            {data.water_ml}<span className="text-sm text-muted">/{data.water_target}</span>
          </div>
          <div className="text-[10px] text-muted mt-1">饮水(ml)</div>
        </div>
      </div>

      {showWeightInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-xs shadow-lg">
            <h2 className="text-lg font-bold text-center mb-4">记录今日体重</h2>
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-2xl text-center"
              placeholder="70.0"
              step="0.1"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowWeightInput(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm">取消</button>
              <button onClick={recordWeight}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm">记录</button>
            </div>
          </div>
        </div>
      )}

      {data.ai_tip && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-xs font-medium text-primary mb-1">AI 今日建议</p>
              <p className="text-sm leading-relaxed">{data.ai_tip}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">今日任务</h2>
          <span className="text-xs text-muted">{completedTasks}/{data.tasks.length} 已完成</span>
        </div>
        <div className="space-y-2">
          {data.tasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-success/5 border-success/20'
                  : 'bg-card border-border active:scale-[0.98]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                task.completed ? 'bg-success border-success text-white' : 'border-border'
              }`}>
                {task.completed && '✓'}
              </div>
              <span className={`text-sm ${task.completed ? 'line-through text-muted' : 'font-medium'}`}>
                {task.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/diet" className="bg-card rounded-xl border border-border p-4 active:scale-[0.98] transition-transform">
          <span className="text-2xl">📸</span>
          <p className="text-sm font-medium mt-2">拍照记录饮食</p>
          <p className="text-[10px] text-muted mt-0.5">AI自动识别热量</p>
        </Link>
        <Link to="/training" className="bg-card rounded-xl border border-border p-4 active:scale-[0.98] transition-transform">
          <span className="text-2xl">🏃</span>
          <p className="text-sm font-medium mt-2">开始训练</p>
          <p className="text-[10px] text-muted mt-0.5">今日推荐课程</p>
        </Link>
      </div>
    </div>
  );
}
