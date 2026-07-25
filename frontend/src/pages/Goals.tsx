import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

const GOALS = [
  { value: 'fat_loss', label: '减脂瘦身', icon: '🔥' },
  { value: 'shaping', label: '塑形增肌', icon: '💪' },
  { value: 'diet', label: '改善饮食', icon: '🥗' },
  { value: 'habit', label: '建立运动习惯', icon: '🏃' },
];

export default function GoalsPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [goal, setGoal] = useState(user?.goal || 'fat_loss');
  const [targetWeight, setTargetWeight] = useState(user?.target_weight?.toString() || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.post('/user/update-goals', {
        goal,
        target_weight: parseFloat(targetWeight) || null,
      });
      await refreshUser();
      navigate(-1);
    } catch {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold tracking-tight text-dark">目标设置</h1>
      </div>

      <div className="premium-card rounded-3xl p-5 space-y-4">
        <div>
          <label className="text-[12px] font-medium text-muted block mb-2">我的目标</label>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map(g => (
              <button key={g.value} onClick={() => setGoal(g.value)}
                className={`p-4 rounded-2xl text-center transition-all ${
                  goal === g.value ? 'bg-warm text-white shadow-glow-sm' : 'bg-gray-50 text-dark'
                }`}>
                <span className="text-[24px] block mb-1">{g.icon}</span>
                <span className="text-[13px] font-semibold">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted block mb-1.5">目标体重</label>
          <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-[14px] text-dark outline-none focus:ring-2 focus:ring-primary/20" placeholder="kg" />
          {user?.current_weight && targetWeight && (
            <p className="text-[11px] text-muted mt-1.5 font-medium">
              还需减重 {(user.current_weight - parseFloat(targetWeight)).toFixed(1)}kg
            </p>
          )}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-bold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50">
        {saving ? '保存中...' : '保存修改'}
      </button>
    </div>
  );
}
