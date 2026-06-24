import { useState } from 'react';

const workouts = [
  { id: '1', name: '全身燃脂HIIT', duration: 20, calories: 180, level: '初级', icon: '🔥' },
  { id: '2', name: '腹部核心训练', duration: 15, calories: 120, level: '初级', icon: '💪' },
  { id: '3', name: '低冲击有氧', duration: 30, calories: 200, level: '入门', icon: '🏃' },
  { id: '4', name: '上肢力量训练', duration: 25, calories: 150, level: '中级', icon: '🏋️' },
  { id: '5', name: '拉伸放松', duration: 10, calories: 40, level: '入门', icon: '🧘' },
];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'library'>('today');

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">训练</h1>

      <div className="flex gap-2">
        {[
          { key: 'today' as const, label: '今日计划' },
          { key: 'library' as const, label: '课程库' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80">今日推荐</p>
          <h2 className="text-lg font-bold mt-1">全身燃脂HIIT · 20分钟</h2>
          <p className="text-sm opacity-80 mt-1">预计消耗 180 kcal</p>
          <button className="mt-4 px-6 py-2.5 bg-white text-primary rounded-xl font-medium text-sm">
            开始训练
          </button>
        </div>
      )}

      <div className="space-y-3">
        {workouts.map(w => (
          <div key={w.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              {w.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{w.name}</p>
              <p className="text-xs text-muted mt-0.5">{w.duration}分钟 · {w.calories}kcal · {w.level}</p>
            </div>
            <button className="px-3 py-1.5 border border-primary text-primary rounded-lg text-xs font-medium">
              开始
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
