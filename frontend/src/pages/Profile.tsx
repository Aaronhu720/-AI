import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [gender, setGender] = useState<string>(user?.gender || 'male');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(user?.current_weight?.toString() || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.post('/user/update-profile', {
        nickname,
        gender,
        age: parseInt(age) || null,
        height: parseFloat(height) || null,
        current_weight: parseFloat(currentWeight) || null,
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
        <h1 className="text-[22px] font-bold tracking-tight text-dark">个人资料</h1>
      </div>

      <div className="premium-card rounded-3xl p-5 space-y-4">
        <div>
          <label className="text-[12px] font-medium text-muted block mb-1.5">昵称</label>
          <input value={nickname} onChange={e => setNickname(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-[14px] text-dark outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted block mb-1.5">性别</label>
          <div className="flex gap-3">
            {[{ v: 'male', l: '男' }, { v: 'female', l: '女' }].map(g => (
              <button key={g.v} onClick={() => setGender(g.v)}
                className={`flex-1 py-3 rounded-xl text-[14px] font-medium transition-all ${
                  gender === g.v ? 'bg-warm text-white shadow-glow-sm' : 'bg-gray-50 text-dark'
                }`}>{g.l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted block mb-1.5">年龄</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-[14px] text-dark outline-none focus:ring-2 focus:ring-primary/20" placeholder="岁" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted block mb-1.5">身高</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-[14px] text-dark outline-none focus:ring-2 focus:ring-primary/20" placeholder="cm" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted block mb-1.5">当前体重</label>
          <input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-[14px] text-dark outline-none focus:ring-2 focus:ring-primary/20" placeholder="kg" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 bg-warm text-white rounded-2xl text-[15px] font-bold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50">
        {saving ? '保存中...' : '保存修改'}
      </button>
    </div>
  );
}
