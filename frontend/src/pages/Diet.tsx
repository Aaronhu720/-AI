import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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
  { key: 'breakfast' as const, label: '早餐', icon: '🌅', time: '7:00-9:00' },
  { key: 'lunch' as const, label: '午餐', icon: '☀️', time: '11:30-13:00' },
  { key: 'dinner' as const, label: '晚餐', icon: '🌙', time: '17:30-19:00' },
  { key: 'snack' as const, label: '加餐', icon: '🍎', time: '随时' },
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
    } catch {}
  }

  useEffect(() => { loadData(); }, []);

  async function searchFoods(q: string) {
    setSearchQuery(q);
    try {
      const results = await api.get<FoodItem[]>(`/diet/foods?q=${encodeURIComponent(q)}`);
      setSearchResults(results);
    } catch {}
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
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    setShowAdd(false);
    loadData();
  }

  async function addCustomFood() {
    if (!customName || !customCal) return;
    await api.post('/diet/meal', {
      meal_type: addingType,
      name: customName,
      calories: parseInt(customCal),
      protein: 0, carbs: 0, fat: 0,
    });
    setShowAdd(false);
    loadData();
  }

  async function removeMeal(id: string) {
    await api.delete(`/diet/meal/${id}`);
    loadData();
  }

  if (!data) return <div className="py-20 text-center text-muted">加载中...</div>;

  const pct = Math.min(Math.round((data.total_calories / data.target_calories) * 100), 100);
  const remaining = Math.max(data.target_calories - data.total_calories, 0);

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">饮食记录</h1>

      {/* Calorie overview */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-5">
          {/* Ring chart */}
          <div className="w-20 h-20 relative flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#E8ECF0" strokeWidth="3" strokeLinecap="round" />
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={pct > 90 ? '#ef4444' : '#FF6B35'} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${pct}, 100`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{pct}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{data.total_calories}</span>
              <span className="text-sm text-muted">/ {data.target_calories} kcal</span>
            </div>
            <p className="text-xs text-muted mt-1">
              {remaining > 0 ? `还可以吃 ${remaining} kcal` : '今日已达标'}
            </p>
            <div className="flex gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[10px] text-muted">蛋白 {data.total_protein}g</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-muted">碳水 {data.total_carbs}g</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] text-muted">脂肪 {data.total_fat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {mealTypes.map(mt => {
          const items = data.meals[mt.key] || [];
          const mealCal = items.reduce((s, m) => s + m.calories, 0);
          return (
            <div key={mt.key} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mt.icon}</span>
                  <span className="text-sm font-medium">{mt.label}</span>
                  {mealCal > 0 && (
                    <span className="text-xs text-primary font-medium">{mealCal} kcal</span>
                  )}
                </div>
                <button
                  onClick={() => openAddMeal(mt.key)}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  + 记录
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-muted py-1">点击记录{mt.label}</p>
              ) : (
                <div className="space-y-1.5 mt-1">
                  {items.map(m => (
                    <div key={m.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{m.name}</span>
                        {m.protein > 0 && (
                          <span className="text-[10px] text-muted">
                            蛋白{m.protein}g
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">{m.calories} kcal</span>
                        <button
                          onClick={() => removeMeal(m.id)}
                          className="w-5 h-5 rounded-full text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="bg-card rounded-t-2xl w-full max-w-lg shadow-lg max-h-[80vh] flex flex-col animate-slide-up">
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">
                  添加{mealTypes.find(m => m.key === addingType)?.label}
                </h2>
                <button onClick={() => setShowAdd(false)} className="text-muted text-xl">×</button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => searchFoods(e.target.value)}
                placeholder="搜索食物..."
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {searchResults.map((food, i) => (
                <button
                  key={i}
                  onClick={() => addFood(food)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border text-left active:bg-primary/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{food.name}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      蛋白{food.protein}g · 碳水{food.carbs}g · 脂肪{food.fat}g
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">{food.calories} kcal</span>
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted mb-2">找不到？手动输入</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="食物名称"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={customCal}
                  onChange={e => setCustomCal(e.target.value)}
                  placeholder="热量"
                  className="w-20 px-3 py-2 border border-border rounded-lg text-sm"
                />
                <button
                  onClick={addCustomFood}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
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
