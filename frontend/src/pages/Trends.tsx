import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Period = '7d' | '30d' | '90d';

interface TrendsData {
  weight_data: { date: string; weight: number }[];
  calorie_data: { date: string; calories: number }[];
  workout_data: { date: string; calories: number; duration: number }[];
  period_loss: number;
  total_loss: number;
  avg_calories: number;
  workout_days: number;
  current_weight: number | null;
  target_weight: number | null;
}

function LineChart({ data, dataKey, color, unit, targetLine }: {
  data: { date: string; [k: string]: unknown }[];
  dataKey: string;
  color: string;
  unit: string;
  targetLine?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted text-sm">
        暂无数据，记录后显示趋势图
      </div>
    );
  }

  const values = data.map(d => d[dataKey] as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = range * 0.15;
  const yMin = min - padding;
  const yMax = max + padding;
  const yRange = yMax - yMin;

  const W = 320;
  const H = 140;
  const PL = 40;
  const PR = 10;
  const PT = 10;
  const PB = 25;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const points = data.map((_, i) => ({
    x: PL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: PT + chartH - ((values[i] - yMin) / yRange) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${PT + chartH} L${points[0].x},${PT + chartH} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks }, (_, i) => yMin + (yRange / (yTicks - 1)) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y grid lines */}
      {yLabels.map((v, i) => {
        const y = PT + chartH - ((v - yMin) / yRange) * chartH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#E8ECF0" strokeWidth="0.5" />
            <text x={PL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#999">
              {Math.round(v)}
            </text>
          </g>
        );
      })}

      {/* Target line */}
      {targetLine && targetLine >= yMin && targetLine <= yMax && (
        <>
          <line
            x1={PL} y1={PT + chartH - ((targetLine - yMin) / yRange) * chartH}
            x2={W - PR} y2={PT + chartH - ((targetLine - yMin) / yRange) * chartH}
            stroke="#2DD4A8" strokeWidth="1" strokeDasharray="4,3"
          />
          <text
            x={W - PR} y={PT + chartH - ((targetLine - yMin) / yRange) * chartH - 3}
            textAnchor="end" fontSize="7" fill="#2DD4A8"
          >目标 {targetLine}{unit}</text>
        </>
      )}

      {/* Area fill */}
      <path d={areaPath} fill={`${color}15`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="1.5" />
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="7" fill={color} fontWeight="600">
            {values[i]}{unit}
          </text>
        </g>
      ))}

      {/* X labels */}
      {data.map((d, i) => {
        if (data.length > 10 && i % Math.ceil(data.length / 7) !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={points[i].x} y={H - 4} textAnchor="middle" fontSize="7" fill="#999">
            {d.date}
          </text>
        );
      })}
    </svg>
  );
}

function BarChart({ data, dataKey, color }: {
  data: { date: string; [k: string]: unknown }[];
  dataKey: string;
  color: string;
}) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted text-sm">
        暂无数据
      </div>
    );
  }

  const values = data.map(d => d[dataKey] as number);
  const max = Math.max(...values) || 1;

  const W = 320;
  const H = 140;
  const PL = 40;
  const PR = 10;
  const PT = 15;
  const PB = 25;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const barW = Math.min(20, chartW / data.length * 0.6);
  const gap = chartW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = PT + chartH * (1 - p);
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#E8ECF0" strokeWidth="0.5" />
            <text x={PL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#999">
              {Math.round(max * p)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const h = (values[i] / max) * chartH;
        const x = PL + gap * i + (gap - barW) / 2;
        const y = PT + chartH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="2" fill={color} opacity="0.8" />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="7" fill={color} fontWeight="600">
              {values[i]}
            </text>
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="7" fill="#999">
              {d.date}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TrendsPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<TrendsData | null>(null);
  const [activeChart, setActiveChart] = useState<'weight' | 'calories' | 'workout'>('weight');

  useEffect(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    api.get<TrendsData>(`/trends/data?days=${days}`).then(setData).catch(() => {});
  }, [period]);

  if (!data) return <div className="py-20 text-center text-muted">加载中...</div>;

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">趋势</h1>

      {/* Period selector */}
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

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">
            {period === '7d' ? '本周' : period === '30d' ? '本月' : '本季'}减重
          </p>
          <p className={`text-2xl font-bold mt-1 ${data.period_loss > 0 ? 'text-success' : data.period_loss < 0 ? 'text-red-500' : ''}`}>
            {data.period_loss > 0 ? '-' : data.period_loss < 0 ? '+' : ''}{Math.abs(data.period_loss)} kg
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">累计减重</p>
          <p className={`text-2xl font-bold mt-1 ${data.total_loss > 0 ? 'text-primary' : ''}`}>
            {data.total_loss > 0 ? '-' : ''}{Math.abs(data.total_loss)} kg
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">日均热量</p>
          <p className="text-2xl font-bold mt-1">{data.avg_calories || '--'} <span className="text-sm text-muted font-normal">kcal</span></p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted">运动天数</p>
          <p className="text-2xl font-bold mt-1">{data.workout_days} <span className="text-sm text-muted font-normal">天</span></p>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="flex gap-2">
        {[
          { key: 'weight' as const, label: '体重' },
          { key: 'calories' as const, label: '热量' },
          { key: 'workout' as const, label: '运动' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveChart(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChart === t.key ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-card rounded-xl border border-border p-4">
        {activeChart === 'weight' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">体重变化</h3>
              {data.current_weight && (
                <span className="text-xs text-muted">当前 {data.current_weight}kg</span>
              )}
            </div>
            <LineChart
              data={data.weight_data}
              dataKey="weight"
              color="#FF6B35"
              unit="kg"
              targetLine={data.target_weight || undefined}
            />
          </>
        )}

        {activeChart === 'calories' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">每日热量摄入</h3>
              {data.avg_calories > 0 && (
                <span className="text-xs text-muted">均值 {data.avg_calories}kcal</span>
              )}
            </div>
            <BarChart
              data={data.calorie_data}
              dataKey="calories"
              color="#FF6B35"


            />
          </>
        )}

        {activeChart === 'workout' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">运动消耗</h3>
              <span className="text-xs text-muted">{data.workout_days}天运动</span>
            </div>
            <BarChart
              data={data.workout_data}
              dataKey="calories"
              color="#2DD4A8"


            />
          </>
        )}
      </div>

      {/* Current status */}
      {data.current_weight && data.target_weight && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium mb-3">目标进度</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted whitespace-nowrap">
              {data.current_weight}kg
            </span>
            <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(
                      ((data.current_weight - (data.current_weight + 5)) / ((data.target_weight) - (data.current_weight + 5))) * 100,
                      5
                    ), 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-xs text-success whitespace-nowrap font-medium">
              {data.target_weight}kg
            </span>
          </div>
          <p className="text-xs text-muted text-center mt-2">
            距离目标还差 {(data.current_weight - data.target_weight).toFixed(1)} kg
          </p>
        </div>
      )}

      {/* AI insight */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-xs font-medium text-primary mb-1">AI 数据洞察</p>
            <p className="text-sm leading-relaxed">
              {data.weight_data.length >= 3
                ? data.period_loss > 0
                  ? `过去${period === '7d' ? '7天' : period === '30d' ? '30天' : '90天'}减重${data.period_loss}kg，进展顺利！保持当前节奏，注意不要减得太快哦 💪`
                  : `体重暂时没有变化，别灰心！坚持记录饮食和运动，效果会慢慢显现的 🌟`
                : '坚持记录体重，积累数据后AI会为你分析减脂趋势和建议 ✨'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
