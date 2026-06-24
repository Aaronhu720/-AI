import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { mockTrainingLibrary, mockTrainingStats, mockTrainingHistory } from '@/lib/mockData';

interface Exercise {
  name: string;
  duration: number;
  rest: number;
}

interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  level: string;
  icon: string;
  description: string;
  exercises: Exercise[];
}

interface WorkoutStats {
  total_workouts: number;
  total_duration_minutes: number;
  total_calories: number;
  week_workouts: number;
}

interface WorkoutLogItem {
  id: string;
  workout_id: string;
  workout_name: string;
  duration_seconds: number;
  calories_burned: number;
  log_date: string;
}

const ICONS: Record<string, React.ReactNode> = {
  fire: <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
  muscle: <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  run: <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  dumbbell: <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h4v12H4V6zm12 0h4v12h-4V6zM8 10h8v4H8v-4z" /></svg>,
  yoga: <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  leg: <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

const ICON_BG: Record<string, string> = {
  fire: 'bg-orange-50', muscle: 'bg-red-50', run: 'bg-blue-50',
  dumbbell: 'bg-purple-50', yoga: 'bg-teal-50', leg: 'bg-emerald-50',
};

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部', hiit: 'HIIT', strength: '力量', cardio: '有氧', stretch: '拉伸',
};

const LEVEL_COLORS: Record<string, string> = {
  '入门': 'bg-emerald-50 text-emerald-600',
  '初级': 'bg-blue-50 text-blue-600',
  '中级': 'bg-amber-50 text-amber-600',
  '高级': 'bg-red-50 text-red-600',
};

type View = 'main' | 'detail' | 'active' | 'complete';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'library' | 'history'>('library');
  const [category, setCategory] = useState('all');
  const [library, setLibrary] = useState<Workout[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [history, setHistory] = useState<WorkoutLogItem[]>([]);
  const [view, setView] = useState<View>('main');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    api.get<Workout[]>('/training/library').then(setLibrary).catch(() => {
      if (import.meta.env.DEV) setLibrary(mockTrainingLibrary as Workout[]);
    });
    api.get<WorkoutStats>('/training/stats').then(setStats).catch(() => {
      if (import.meta.env.DEV) setStats(mockTrainingStats);
    });
  }, []);

  function loadHistory() {
    api.get<WorkoutLogItem[]>('/training/history').then(setHistory).catch(() => {
      if (import.meta.env.DEV) setHistory(mockTrainingHistory as WorkoutLogItem[]);
    });
  }

  function openDetail(w: Workout) { setSelectedWorkout(w); setView('detail'); }

  function startWorkout() {
    if (!selectedWorkout) return;
    setCurrentExIdx(0); setIsResting(false);
    setTimeLeft(selectedWorkout.exercises[0].duration);
    setTotalElapsed(0); setIsPaused(false); setView('active');
  }

  const finishWorkout = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!selectedWorkout) return;
    setView('complete');
    try {
      await api.post('/training/log', {
        workout_id: selectedWorkout.id, workout_name: selectedWorkout.name,
        duration_seconds: totalElapsed,
        calories_burned: Math.round(selectedWorkout.calories * (totalElapsed / (selectedWorkout.duration * 60))),
      });
      api.get<WorkoutStats>('/training/stats').then(setStats).catch(() => {});
    } catch {}
  }, [selectedWorkout, totalElapsed]);

  const moveToNext = useCallback(() => {
    if (!selectedWorkout) return;
    const exercises = selectedWorkout.exercises;
    if (isResting) {
      const nextIdx = currentExIdx + 1;
      if (nextIdx >= exercises.length) { finishWorkout(); return; }
      setCurrentExIdx(nextIdx); setIsResting(false);
      setTimeLeft(exercises[nextIdx].duration);
    } else {
      setIsResting(true); setTimeLeft(exercises[currentExIdx].rest);
    }
  }, [selectedWorkout, currentExIdx, isResting, finishWorkout]);

  useEffect(() => {
    if (view !== 'active' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTotalElapsed(p => p + 1);
      setTimeLeft(p => { if (p <= 1) { moveToNext(); return 0; } return p - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, isPaused, moveToNext]);

  function quitWorkout() { if (timerRef.current) clearInterval(timerRef.current); setView('main'); }
  function backToMain() { setView('main'); loadHistory(); }

  const filtered = category === 'all' ? library : library.filter(w => w.category === category);

  // --- Active workout ---
  if (view === 'active' && selectedWorkout) {
    const ex = selectedWorkout.exercises[currentExIdx];
    const progress = (currentExIdx + (isResting ? 0.5 : 0)) / selectedWorkout.exercises.length;
    return (
      <div className="min-h-[80vh] flex flex-col animate-fade-in">
        <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden mb-5">
          <div className="h-full bg-warm rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center justify-between mb-8">
          <button onClick={quitWorkout} className="text-[13px] text-muted font-medium">退出</button>
          <span className="text-[13px] text-muted font-medium">{currentExIdx + 1}/{selectedWorkout.exercises.length}</span>
          <span className="text-[13px] font-mono text-muted">{Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {isResting ? (
            <>
              <p className="text-[13px] text-muted font-medium mb-3">休息一下</p>
              <div className="text-[72px] font-extrabold text-warm leading-none mb-4">{timeLeft}</div>
              <p className="text-[13px] text-muted">下一个: {
                currentExIdx + 1 < selectedWorkout.exercises.length
                  ? selectedWorkout.exercises[currentExIdx + 1].name : '训练完成!'
              }</p>
            </>
          ) : (
            <>
              <div className="w-28 h-28 rounded-3xl bg-primary-light flex items-center justify-center mb-8">
                <div className="scale-[2]">{ICONS[selectedWorkout.icon] || ICONS.fire}</div>
              </div>
              <h2 className="text-xl font-bold text-dark mb-3">{ex.name}</h2>
              <div className="text-[72px] font-extrabold text-warm leading-none mb-2">{timeLeft}</div>
              <p className="text-[13px] text-muted font-medium">秒</p>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 py-4 rounded-2xl text-[13px] font-semibold transition-all ${
              isPaused ? 'bg-warm text-white shadow-glow' : 'premium-card'
            }`}>
            {isPaused ? '继续' : '暂停'}
          </button>
          <button onClick={moveToNext}
            className="flex-1 py-4 bg-warm text-white rounded-2xl text-[13px] font-semibold shadow-glow">
            {isResting ? '跳过休息' : '下一个'}
          </button>
        </div>
      </div>
    );
  }

  // --- Complete ---
  if (view === 'complete' && selectedWorkout) {
    const cals = Math.round(selectedWorkout.calories * (totalElapsed / (selectedWorkout.duration * 60)));
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8">
          <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-dark mb-2">训练完成！</h1>
        <p className="text-[13px] text-muted mb-10">太棒了，继续保持！</p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-10">
          {[
            { value: Math.floor(totalElapsed / 60), label: '分钟', color: 'text-primary' },
            { value: cals, label: '千卡', color: 'text-secondary' },
            { value: selectedWorkout.exercises.length, label: '动作', color: 'text-blue-500' },
          ].map(item => (
            <div key={item.label} className="premium-card rounded-2xl p-4 text-center">
              <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[11px] text-muted mt-1 font-medium">{item.label}</div>
            </div>
          ))}
        </div>

        <button onClick={backToMain} className="w-full max-w-xs py-4 bg-warm text-white rounded-2xl font-semibold shadow-glow">
          返回
        </button>
      </div>
    );
  }

  // --- Detail ---
  if (view === 'detail' && selectedWorkout) {
    return (
      <div className="space-y-4 pb-6 animate-fade-in">
        <button onClick={() => setView('main')} className="text-[13px] text-muted font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        <div className="bg-warm rounded-3xl p-6 text-white shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="flex items-center gap-4 mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <div className="text-white [&_svg]:text-white">{ICONS[selectedWorkout.icon] || ICONS.fire}</div>
            </div>
            <div>
              <h1 className="text-lg font-bold">{selectedWorkout.name}</h1>
              <p className="text-sm opacity-80 mt-0.5">{selectedWorkout.description}</p>
            </div>
          </div>
          <div className="flex gap-5 relative">
            <span className="text-[13px] opacity-80 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              {selectedWorkout.duration}分钟
            </span>
            <span className="text-[13px] opacity-80 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
              {selectedWorkout.calories}kcal
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/20`}>
              {selectedWorkout.level}
            </span>
          </div>
        </div>

        <div className="premium-card rounded-3xl p-5">
          <h2 className="text-[13px] font-semibold text-dark mb-4">训练动作 ({selectedWorkout.exercises.length}个)</h2>
          <div className="space-y-2">
            {selectedWorkout.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-1">
                <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-[13px] font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-dark">{ex.name}</p>
                  <p className="text-[11px] text-muted mt-0.5">{ex.duration}秒 · 休息{ex.rest}秒</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startWorkout}
          className="w-full py-4 bg-warm text-white rounded-2xl font-semibold text-[15px] shadow-glow active:scale-[0.98] transition-transform">
          开始训练
        </button>
      </div>
    );
  }

  // --- Main ---
  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <h1 className="text-[22px] font-bold tracking-tight text-dark">训练</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { value: stats.week_workouts, label: '本周训练', color: 'text-primary' },
            { value: stats.total_workouts, label: '总次数', color: 'text-secondary' },
            { value: stats.total_duration_minutes, label: '总时长(分)', color: 'text-amber-500' },
            { value: stats.total_calories, label: '总消耗', color: 'text-red-500' },
          ].map(item => (
            <div key={item.label} className="premium-card rounded-2xl p-3 text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-muted font-medium mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {(['library', 'history'] as const).map(tab => (
          <button key={tab}
            onClick={() => { setActiveTab(tab); if (tab === 'history') loadHistory(); }}
            className={`px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all ${
              activeTab === tab ? 'bg-warm text-white shadow-glow-sm' : 'premium-card text-muted'
            }`}>
            {tab === 'library' ? '课程库' : '训练记录'}
          </button>
        ))}
      </div>

      {activeTab === 'library' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => setCategory(key)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                  category === key ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-black/[0.02]'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filtered.map(w => (
              <button key={w.id} onClick={() => openDetail(w)}
                className="w-full premium-card rounded-2xl p-4 flex items-center gap-4 text-left">
                <div className={`w-12 h-12 rounded-2xl ${ICON_BG[w.icon] || 'bg-orange-50'} flex items-center justify-center`}>
                  {ICONS[w.icon] || ICONS.fire}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-dark">{w.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted">{w.duration}分钟</span>
                    <span className="text-[11px] text-muted">·</span>
                    <span className="text-[11px] text-muted">{w.calories}kcal</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${LEVEL_COLORS[w.level] || 'bg-gray-50 text-gray-600'}`}>
                      {w.level}
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2.5">
          {history.length === 0 ? (
            <div className="premium-card rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-[13px] text-muted font-medium">还没有训练记录</p>
              <p className="text-[11px] text-muted mt-1">开始你的第一次训练吧！</p>
            </div>
          ) : (
            history.map(h => (
              <div key={h.id} className="premium-card rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-dark">{h.workout_name}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {h.log_date} · {Math.floor(h.duration_seconds / 60)}分钟 · {h.calories_burned}kcal
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
