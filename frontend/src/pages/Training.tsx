import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

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

const ICONS: Record<string, string> = {
  fire: '🔥', muscle: '💪', run: '🏃', dumbbell: '🏋️',
  yoga: '🧘', leg: '🦵',
};

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部', hiit: 'HIIT', strength: '力量', cardio: '有氧', stretch: '拉伸',
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

  // Timer state
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    api.get<Workout[]>('/training/library').then(setLibrary).catch(() => {});
    api.get<WorkoutStats>('/training/stats').then(setStats).catch(() => {});
  }, []);

  function loadHistory() {
    api.get<WorkoutLogItem[]>('/training/history').then(setHistory).catch(() => {});
  }

  function openDetail(w: Workout) {
    setSelectedWorkout(w);
    setView('detail');
  }

  function startWorkout() {
    if (!selectedWorkout) return;
    setCurrentExIdx(0);
    setIsResting(false);
    setTimeLeft(selectedWorkout.exercises[0].duration);
    setTotalElapsed(0);
    setIsPaused(false);
    setView('active');
  }

  const finishWorkout = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!selectedWorkout) return;
    setView('complete');
    try {
      await api.post('/training/log', {
        workout_id: selectedWorkout.id,
        workout_name: selectedWorkout.name,
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
      if (nextIdx >= exercises.length) {
        finishWorkout();
        return;
      }
      setCurrentExIdx(nextIdx);
      setIsResting(false);
      setTimeLeft(exercises[nextIdx].duration);
    } else {
      setIsResting(true);
      setTimeLeft(exercises[currentExIdx].rest);
    }
  }, [selectedWorkout, currentExIdx, isResting, finishWorkout]);

  useEffect(() => {
    if (view !== 'active' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTotalElapsed(p => p + 1);
      setTimeLeft(p => {
        if (p <= 1) {
          moveToNext();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, isPaused, moveToNext]);

  function quitWorkout() {
    if (timerRef.current) clearInterval(timerRef.current);
    setView('main');
  }

  function backToMain() {
    setView('main');
    loadHistory();
  }

  const filtered = category === 'all' ? library : library.filter(w => w.category === category);

  // --- Active workout screen ---
  if (view === 'active' && selectedWorkout) {
    const ex = selectedWorkout.exercises[currentExIdx];
    const progress = (currentExIdx + (isResting ? 0.5 : 0)) / selectedWorkout.exercises.length;
    return (
      <div className="min-h-[80vh] flex flex-col">
        {/* Progress bar */}
        <div className="h-1.5 bg-border rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <button onClick={quitWorkout} className="text-sm text-muted">退出</button>
          <span className="text-sm text-muted">{currentExIdx + 1}/{selectedWorkout.exercises.length}</span>
          <span className="text-sm text-muted">{Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {isResting ? (
            <>
              <p className="text-sm text-muted mb-2">休息一下</p>
              <div className="text-7xl font-bold text-secondary mb-4">{timeLeft}</div>
              <p className="text-sm text-muted">下一个: {
                currentExIdx + 1 < selectedWorkout.exercises.length
                  ? selectedWorkout.exercises[currentExIdx + 1].name
                  : '训练完成!'
              }</p>
            </>
          ) : (
            <>
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-5xl">{ICONS[selectedWorkout.icon] || '🔥'}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{ex.name}</h2>
              <div className="text-6xl font-bold text-primary mb-4">{timeLeft}</div>
              <p className="text-sm text-muted">秒</p>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 py-3.5 rounded-xl text-sm font-medium ${
              isPaused ? 'bg-primary text-white' : 'bg-card border border-border'
            }`}
          >
            {isPaused ? '继续' : '暂停'}
          </button>
          <button
            onClick={moveToNext}
            className="flex-1 py-3.5 bg-secondary text-white rounded-xl text-sm font-medium"
          >
            {isResting ? '跳过休息' : '下一个'}
          </button>
        </div>
      </div>
    );
  }

  // --- Complete screen ---
  if (view === 'complete' && selectedWorkout) {
    const cals = Math.round(selectedWorkout.calories * (totalElapsed / (selectedWorkout.duration * 60)));
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <span className="text-5xl">🎉</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">训练完成！</h1>
        <p className="text-sm text-muted mb-8">太棒了，继续保持！</p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-xl font-bold text-primary">{Math.floor(totalElapsed / 60)}</div>
            <div className="text-[10px] text-muted mt-1">分钟</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-xl font-bold text-secondary">{cals}</div>
            <div className="text-[10px] text-muted mt-1">千卡</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-xl font-bold text-blue-500">{selectedWorkout.exercises.length}</div>
            <div className="text-[10px] text-muted mt-1">动作</div>
          </div>
        </div>

        <button onClick={backToMain} className="w-full max-w-xs py-3.5 bg-primary text-white rounded-xl font-medium">
          返回
        </button>
      </div>
    );
  }

  // --- Detail screen ---
  if (view === 'detail' && selectedWorkout) {
    return (
      <div className="space-y-5 pb-6">
        <button onClick={() => setView('main')} className="text-sm text-muted flex items-center gap-1">
          ← 返回
        </button>

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
              {ICONS[selectedWorkout.icon] || '🔥'}
            </div>
            <div>
              <h1 className="text-lg font-bold">{selectedWorkout.name}</h1>
              <p className="text-sm opacity-80">{selectedWorkout.description}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-sm opacity-80">⏱ {selectedWorkout.duration}分钟</span>
            <span className="text-sm opacity-80">🔥 {selectedWorkout.calories}kcal</span>
            <span className="text-sm opacity-80">📊 {selectedWorkout.level}</span>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold mb-3">训练动作 ({selectedWorkout.exercises.length}个)</h2>
          <div className="space-y-2">
            {selectedWorkout.exercises.map((ex, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-muted mt-0.5">{ex.duration}秒 · 休息{ex.rest}秒</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startWorkout}
          className="w-full py-3.5 bg-primary text-white rounded-xl font-medium text-base"
        >
          开始训练
        </button>
      </div>
    );
  }

  // --- Main screen ---
  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">训练</h1>

      {/* Stats card */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-card rounded-xl border border-border p-2.5 text-center">
            <div className="text-lg font-bold text-primary">{stats.week_workouts}</div>
            <div className="text-[10px] text-muted">本周训练</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-2.5 text-center">
            <div className="text-lg font-bold text-secondary">{stats.total_workouts}</div>
            <div className="text-[10px] text-muted">总训练次数</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-2.5 text-center">
            <div className="text-lg font-bold text-orange-500">{stats.total_duration_minutes}</div>
            <div className="text-[10px] text-muted">总时长(分)</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-2.5 text-center">
            <div className="text-lg font-bold text-red-500">{stats.total_calories}</div>
            <div className="text-[10px] text-muted">总消耗</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'library' as const, label: '课程库' },
          { key: 'history' as const, label: '训练记录' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === 'history') loadHistory(); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === 'library' && (
        <>
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  category === key ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted'
                }`}
              >{label}</button>
            ))}
          </div>

          {/* Workout cards */}
          <div className="space-y-3">
            {filtered.map(w => (
              <button
                key={w.id}
                onClick={() => openDetail(w)}
                className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {ICONS[w.icon] || '🔥'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-xs text-muted mt-0.5">{w.duration}分钟 · {w.calories}kcal · {w.level}</p>
                </div>
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              还没有训练记录，开始你的第一次训练吧！
            </div>
          ) : (
            history.map(h => (
              <div key={h.id} className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-lg">✅</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.workout_name}</p>
                  <p className="text-xs text-muted mt-0.5">
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
