import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { mockDiet, mockFoods } from '@/lib/mockData';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietData {
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snack: MealItem[];
  };
  total_calories: number;
  target_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

const mealTypes = [
  {
    key: 'breakfast' as const, label: '早餐', time: '7:00-9:00',
    color: 'text-amber-500', bg: 'bg-amber-50',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    key: 'lunch' as const, label: '午餐', time: '11:30-13:00',
    color: 'text-orange-500', bg: 'bg-orange-50',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
  },
  {
    key: 'dinner' as const, label: '晚餐', time: '17:30-19:00',
    color: 'text-indigo-500', bg: 'bg-indigo-50',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  },
  {
    key: 'snack' as const, label: '加餐', time: '随时',
    color: 'text-emerald-500', bg: 'bg-emerald-50',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  },
];

const MACRO_COLORS = [
  { label: '蛋白质', color: 'bg-red-400', ring: '#F87171' },
  { label: '碳水', color: 'bg-amber-400', ring: '#FBBF24' },
  { label: '脂肪', color: 'bg-blue-400', ring: '#60A5FA' },
];

export default function DietPage() {
  const [data, setData] = useState<DietData | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addingType, setAddingType] = useState<string>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');

  async function loadData() {
    try {
      const d = await api.get<DietData>('/diet/today');
      setData(d);
    } catch {
      if (import.meta.env.DEV) setData(mockDiet as DietData);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function searchFoods(q: string) {
    setSearchQuery(q);
    try {
      const results = await api.get<FoodItem[]>(`/diet/foods?q=${encodeURIComponent(q)}`);
      setSearchResults(results);
    } catch {
      if (import.meta.env.DEV) {
        const filtered = q ? mockFoods.filter(f => f.name.includes(q)) : mockFoods;
        setSearchResults(filtered);
      }
    }
  }

  function openAddMeal(type: string) {
    setAddingType(type);
    setSearchQuery('');
    setCustomName('');
    setCustomCal('');
    setShowAdd(true);
    searchFoods('');
  }

  async function addFood(food: FoodItem) {
    await api.post('/diet/meal', {
      meal_type: addingType,
      name: food.name, calories: food.calories,
      protein: food.protein, carbs: food.carbs, fat: food.fat,
    });
    setShowAdd(false);
    loadData();
  }

  async function addCustomFood() {
    if (!customName || !customCal) return;
    await api.post('/diet/meal', {
      meal_type: addingType, name: customName,
      calories: parseInt(customCal), protein: 0, carbs: 0, fat: 0,
    });
    setShowAdd(false);
    loadData();
  }

  async function removeMeal(id: string) {
    await api.delete(`/diet/meal/${id}`);
    loadData();
  }

  if (!data) return <div className="py-20 text-center text-muted text-[13px] font-medium">加载中...</div>;

  const pct = Math.min(Math.round((data.total_calories / data.target_calories) * 100), 100);
  const remaining = Math.max(data.target_calories - data.total_calories, 0);
  const macros = [data.total_protein, data.total_carbs, data.total_fat];

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <h1 className="text-[22px] font-bold tracking-tight text-dark">饮食记录</h1>

      {/* Calorie overview */}
      <div className="premium-card rounded-3xl p-5">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 relative shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F06225" />
                  <stop offset="100%" stopColor="#F5A623" />
                </linearGradient>
              </defs>
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#F5F6F8" strokeWidth="3" strokeLinecap="round" />
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="url(#cal-grad)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${pct}, 100`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-dark">{pct}<span className="text-[11px] text-muted font-medium">%</span></span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-warm">{data.total_calories}</span>
              <span className="text-[11px] text-muted font-medium">/ {data.target_calories} kcal</span>
            </div>
            <p className="text-[11px] text-muted mt-1 font-medium">
              {remaining > 0 ? `还可以吃 ${remaining} kcal` : '今日已达标'}
            </p>
            <div className="flex gap-3 mt-2.5">
              {MACRO_COLORS.map((m, i) => (
                <div key={m.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${m.color}`} />
                  <span className="text-[10px] text-muted font-medium">{m.label} {macros[i]}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-2.5">
        {mealTypes.map(mt => {
          const items = data.meals[mt.key] || [];
          const mealCal = items.reduce((s, m) => s + m.calories, 0);
          return (
            <div key={mt.key} className="premium-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${mt.bg} flex items-center justify-center ${mt.color}`}>
                    {mt.icon}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-dark">{mt.label}</span>
                    {mealCal > 0 && (
                      <span className="text-[11px] text-primary font-semibold ml-2">{mealCal} kcal</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openAddMeal(mt.key)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary/8 text-primary text-[11px] font-semibold active:scale-95 transition-transform"
                >
                  + 记录
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-[11px] text-muted py-1 pl-12 font-medium">点击记录{mt.label}</p>
              ) : (
                <div className="space-y-1 mt-1 pl-12">
                  {items.map(m => (
                    <div key={m.id} className="flex items-center justify-between group py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-dark">{m.name}</span>
                        {m.protein > 0 && (
                          <span className="text-[10px] text-muted font-medium">蛋白{m.protein}g</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-muted font-medium">{m.calories} kcal</span>
                        <button
                          onClick={() => removeMeal(m.id)}
                          className="w-5 h-5 rounded-full text-[11px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add meal modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl w-full max-w-lg shadow-float max-h-[80vh] flex flex-col animate-slide-up">
            <div className="p-5 border-b border-black/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-dark">
                  添加{mealTypes.find(m => m.key === addingType)?.label}
                </h2>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl bg-black/[0.04] flex items-center justify-center text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => searchFoods(e.target.value)}
                  placeholder="搜索食物..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-[13px] bg-black/[0.03] border-0 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {searchResults.map((food, i) => (
                <button
                  key={i}
                  onClick={() => addFood(food)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl text-left active:bg-primary/5 transition-colors hover:bg-black/[0.02]"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-dark">{food.name}</p>
                    <p className="text-[10px] text-muted mt-0.5 font-medium">
                      蛋白{food.protein}g · 碳水{food.carbs}g · 脂肪{food.fat}g
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-primary">{food.calories}</span>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-black/[0.04]">
              <p className="text-[11px] text-muted font-medium mb-2">找不到？手动输入</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="食物名称"
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] bg-black/[0.03] border-0 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="number"
                  value={customCal}
                  onChange={e => setCustomCal(e.target.value)}
                  placeholder="热量"
                  className="w-20 px-3 py-2.5 rounded-xl text-[13px] bg-black/[0.03] border-0 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={addCustomFood}
                  className="px-5 py-2.5 bg-warm text-white rounded-xl text-[13px] font-semibold shadow-glow-sm active:scale-95 transition-transform"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
