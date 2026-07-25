import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REMINDERS = [
  { key: 'weigh', label: '称重提醒', desc: '每日提醒记录体重', icon: '⚖️', defaultTime: '08:00' },
  { key: 'breakfast', label: '早餐提醒', desc: '提醒记录早餐', icon: '🌅', defaultTime: '08:30' },
  { key: 'lunch', label: '午餐提醒', desc: '提醒记录午餐', icon: '☀️', defaultTime: '12:30' },
  { key: 'dinner', label: '晚餐提醒', desc: '提醒记录晚餐', icon: '🌙', defaultTime: '18:30' },
  { key: 'water', label: '饮水提醒', desc: '每2小时提醒喝水', icon: '💧', defaultTime: '10:00' },
  { key: 'workout', label: '运动提醒', desc: '提醒完成今日运动', icon: '🏋️', defaultTime: '19:00' },
];

export default function RemindersPage() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    weigh: false, breakfast: false, lunch: false, dinner: false, water: false, workout: false,
  });

  function toggle(key: string) {
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold tracking-tight text-dark">提醒设置</h1>
      </div>

      <div className="premium-card rounded-3xl overflow-hidden">
        {REMINDERS.map((r, i) => (
          <div key={r.key}
            className={`flex items-center gap-3.5 p-4 ${
              i < REMINDERS.length - 1 ? 'border-b border-black/[0.04]' : ''
            }`}>
            <span className="text-[22px] w-9 text-center">{r.icon}</span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-dark">{r.label}</p>
              <p className="text-[11px] text-muted font-medium mt-0.5">{r.desc}</p>
            </div>
            <button onClick={() => toggle(r.key)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                enabled[r.key] ? 'bg-warm' : 'bg-gray-200'
              }`}>
              <div className={`w-5.5 h-5.5 w-[22px] h-[22px] rounded-full bg-white shadow-sm absolute top-[3px] transition-transform ${
                enabled[r.key] ? 'translate-x-[22px]' : 'translate-x-[3px]'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-muted font-medium leading-relaxed px-4">
        提醒功能需要开启系统通知权限。开启后，小燃会在设定时间发送推送通知。
      </p>
    </div>
  );
}
