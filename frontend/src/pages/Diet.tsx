import { useState } from 'react';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  photo_url?: string;
}

const mealTypes = [
  { key: 'breakfast' as const, label: '早餐', icon: '🌅', time: '7:00-9:00' },
  { key: 'lunch' as const, label: '午餐', icon: '☀️', time: '11:30-13:00' },
  { key: 'dinner' as const, label: '晚餐', icon: '🌙', time: '17:30-19:00' },
  { key: 'snack' as const, label: '加餐', icon: '🍎', time: '随时' },
];

export default function DietPage() {
  const [meals] = useState<Meal[]>([]);
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold">饮食记录</h1>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">今日摄入</p>
            <p className="text-2xl font-bold">{totalCalories} <span className="text-sm text-muted font-normal">/ 1800 kcal</span></p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#E8ECF0" strokeWidth="3" />
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#FF6B35" strokeWidth="3"
                strokeDasharray={`${Math.min((totalCalories / 1800) * 100, 100)}, 100`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {Math.round((totalCalories / 1800) * 100)}%
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted">
          <span>蛋白质 --g</span>
          <span>碳水 --g</span>
          <span>脂肪 --g</span>
        </div>
      </div>

      <div className="space-y-3">
        {mealTypes.map(mt => {
          const mealItems = meals.filter(m => m.type === mt.key);
          return (
            <div key={mt.key} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mt.icon}</span>
                  <span className="text-sm font-medium">{mt.label}</span>
                  <span className="text-xs text-muted">{mt.time}</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg">
                  +
                </button>
              </div>
              {mealItems.length === 0 ? (
                <p className="text-xs text-muted">点击 + 记录{mt.label}</p>
              ) : (
                <div className="space-y-1.5">
                  {mealItems.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span>{m.name}</span>
                      <span className="text-muted">{m.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="w-full py-3.5 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2">
        <span className="text-lg">📸</span>
        拍照识别饮食
      </button>
    </div>
  );
}
