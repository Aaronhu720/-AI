import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { mockTrends } from '@/lib/mockData';

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
      <div className="h-40 flex flex-col items-center justify-center">
        <svg className="w-10 h-10 text-muted/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-[12px] text-muted font-medium">暂无数据，记录后显示趋势图</span>
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

  const W = 320, H = 140, PL = 40, PR = 10, PT = 10, PB = 25;
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
      <defs>
        <linearGradient id={`area-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yLabels.map((v, i) => {
        const y = PT + chartH - ((v - yMin) / yRange) * chartH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#F0F0F0" strokeWidth="0.5" />
            <text x={PL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#ABABAB">{Math.round(v)}</text>
          </g>
        );
      })}
      {targetLine && targetLine >= yMin && targetLine <= yMax && (
        <>
          <line x1={PL} y1={PT + chartH - ((targetLine - yMin) / yRange) * chartH}
            x2={W - PR} y2={PT + chartH - ((targetLine - yMin) / yRange) * chartH}
            stroke="#22C997" strokeWidth="1" strokeDasharray="4,3" />
          <text x={W - PR} y={PT + chartH - ((targetLine - yMin) / yRange) * chartH - 3}
            textAnchor="end" fontSize="7" fill="#22C997" fontWeight="600">目标 {targetLine}{unit}</text>
        </>
      )}
      <path d={areaPath} fill={`url(#area-${dataKey})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="7" fill={color} fontWeight="700">{values[i]}{unit}</text>
        </g>
      ))}
      {data.map((d, i) => {
        if (data.length > 10 && i % Math.ceil(data.length / 7) !== 0 && i !== data.length - 1) return null;
        return <text key={i} x={points[i].x} y={H - 4} textAnchor="middle" fontSize="7" fill="#ABABAB">{d.date}</text>;
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
      <div className="h-40 flex flex-col items-center justify-center">
        <svg className="w-10 h-10 text-muted/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-[12px] text-muted font-medium">暂无数据</span>
      </div>
    );
  }

  const values = data.map(d => d[dataKey] as number);
  const max = Math.max(...values) || 1;

  const W = 320, H = 140, PL = 40, PR = 10, PT = 15, PB = 25;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const barW = Math.min(16, chartW / data.length * 0.5);
  const gap = chartW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id={`bar-${dataKey}-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = PT + chartH * (1 - p);
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#F0F0F0" strokeWidth="0.5" />
            <text x={PL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#ABABAB">{Math.round(max * p)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (values[i] / max) * chartH;
        const x = PL + gap * i + (gap - barW) / 2;
        const y = PT + chartH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={barW / 3}
              fill={`url(#bar-${dataKey}-${color.replace('#','')})`} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="7" fill={color} fontWeight="700">{values[i]}</text>
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="7" fill="#ABABAB">{d.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

const STAT_ICONS = {
  loss: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  total: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  cal: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
  workout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

export default function TrendsPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<TrendsData | null>(null);
  const [activeChart, setActiveChart] = useState<'weight' | 'calories' | 'workout'>('weight');

  useEffect(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    api.get<TrendsData>(`/trends/data?days=${days}`).then(setData).catch(() => {
      if (import.meta.env.DEV) setData(mockTrends as TrendsData);
    });
  }, [period]);

  if (!data) return <div className="py-20 text-center text-muted text-[13px] font-medium">加载中...</div>;

  const periodLabel = period === '7d' ? '本周' : period === '30d' ? '本月' : '本季';

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <h1 className="text-[22px] font-bold tracking-tight text-dark">趋势</h1>

      <div className="flex gap-2">
        {([
          { key: '7d' as const, label: '7天' },
          { key: '30d' as const, label: '30天' },
          { key: '90d' as const, label: '90天' },
        ]).map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all ${
              period === p.key ? 'bg-warm text-white shadow-glow-sm' : 'premium-card text-muted'
            }`}
          >{p.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: STAT_ICONS.loss, value: data.period_loss, label: `${periodLabel}减重`, unit: 'kg',
            color: data.period_loss > 0 ? 'text-emerald-500' : data.period_loss < 0 ? 'text-red-500' : 'text-dark',
            iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50',
            format: (v: number) => `${v > 0 ? '-' : v < 0 ? '+' : ''}${Math.abs(v)}` },
          { icon: STAT_ICONS.total, value: data.total_loss, label: '累计减重', unit: 'kg',
            color: data.total_loss > 0 ? 'text-primary' : 'text-dark',
            iconColor: 'text-primary', iconBg: 'bg-primary-light',
            format: (v: number) => `${v > 0 ? '-' : ''}${Math.abs(v)}` },
          { icon: STAT_ICONS.cal, value: data.avg_calories, label: '日均热量', unit: 'kcal',
            color: 'text-amber-500', iconColor: 'text-amber-500', iconBg: 'bg-amber-50',
            format: (v: number) => v || '--' },
          { icon: STAT_ICONS.workout, value: data.workout_days, label: '运动天数', unit: '天',
            color: 'text-blue-500', iconColor: 'text-blue-500', iconBg: 'bg-blue-50',
            format: (v: number) => v },
        ].map(item => (
          <div key={item.label} className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                {item.icon}
              </div>
            </div>
            <div className={`text-xl font-bold ${item.color}`}>
              {item.format(item.value)}
              <span className="text-[11px] text-muted font-medium ml-1">{item.unit}</span>
            </div>
            <p className="text-[11px] text-muted font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {([
          { key: 'weight' as const, label: '体重' },
          { key: 'calories' as const, label: '热量' },
          { key: 'workout' as const, label: '运动' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveChart(t.key)}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
              activeChart === t.key ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-black/[0.02]'
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="premium-card rounded-3xl p-5">
        {activeChart === 'weight' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-dark">体重变化</h3>
              {data.current_weight && (
                <span className="text-[11px] text-muted font-medium">当前 {data.current_weight}kg</span>
              )}
            </div>
            <LineChart data={data.weight_data} dataKey="weight" color="#F06225" unit="kg"
              targetLine={data.target_weight || undefined} />
          </>
        )}
        {activeChart === 'calories' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-dark">每日热量摄入</h3>
              {data.avg_calories > 0 && (
                <span className="text-[11px] text-muted font-medium">均值 {data.avg_calories}kcal</span>
              )}
            </div>
            <BarChart data={data.calorie_data} dataKey="calories" color="#F06225" />
          </>
        )}
        {activeChart === 'workout' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-dark">运动消耗</h3>
              <span className="text-[11px] text-muted font-medium">{data.workout_days}天运动</span>
            </div>
            <BarChart data={data.workout_data} dataKey="calories" color="#22C997" />
          </>
        )}
      </div>

      {data.current_weight && data.target_weight && (
        <div className="premium-card rounded-3xl p-5">
          <h3 className="text-[13px] font-semibold text-dark mb-3">目标进度</h3>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted whitespace-nowrap font-semibold">{data.current_weight}kg</span>
            <div className="flex-1 h-2.5 bg-black/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-warm rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(
                    ((data.current_weight - (data.current_weight + 5)) / ((data.target_weight) - (data.current_weight + 5))) * 100,
                    5), 100)}%`,
                }} />
            </div>
            <span className="text-[11px] text-emerald-500 whitespace-nowrap font-semibold">{data.target_weight}kg</span>
          </div>
          <p className="text-[11px] text-muted text-center mt-2.5 font-medium">
            距离目标还差 {(data.current_weight - data.target_weight).toFixed(1)} kg
          </p>
        </div>
      )}

      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-primary mb-1">AI 数据洞察</p>
            <p className="text-[13px] leading-relaxed text-dark/80">
              {data.weight_data.length >= 3
                ? data.period_loss > 0
                  ? `过去${periodLabel}减重${data.period_loss}kg，进展顺利！保持当前节奏，注意不要减得太快哦`
                  : '体重暂时没有变化，别灰心！坚持记录饮食和运动，效果会慢慢显现的'
                : '坚持记录体重，积累数据后AI会为你分析减脂趋势和建议'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
