import { useState } from 'react';

type Period = '7d' | '30d' | '90d';

export default function TrendsPage() {
  const [period, setPeriod] = useState<Period>('7d');

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">趋势</h1>

      <div className="flex gap-2">
        {[
          { key: '7d' as const, label: '7天' },
          { key: '30d' as const, label: '30天' },
          { key: '90d' as const, label: '90天' },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === p.key ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
            }`}
          >{p.label}</button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium mb-3">体重变化</h3>
        <div className="h-40 flex items-center justify-center text-muted text-sm">
          记录体重后显示趋势图
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">本周减重</p>
          <p className="text-2xl font-bold text-success mt-1">-- kg</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">累计减重</p>
          <p className="text-2xl font-bold text-primary mt-1">-- kg</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">平均热量</p>
          <p className="text-2xl font-bold mt-1">-- kcal</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">运动天数</p>
          <p className="text-2xl font-bold mt-1">-- 天</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium mb-3">热量摄入趋势</h3>
        <div className="h-40 flex items-center justify-center text-muted text-sm">
          记录饮食后显示趋势图
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-xs font-medium text-primary mb-1">AI 周报</p>
            <p className="text-sm text-muted">完成一周记录后，AI会自动生成减脂周报</p>
          </div>
        </div>
      </div>
    </div>
  );
}
