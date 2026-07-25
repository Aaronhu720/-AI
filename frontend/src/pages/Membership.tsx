import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '📸', title: '无限拍照识食', desc: '拍照自动识别食物和营养成分' },
  { icon: '🤖', title: 'AI教练对话', desc: '智能减脂建议、饮食分析' },
  { icon: '📊', title: '跨数据分析', desc: '整合运动+饮食+体重综合建议' },
  { icon: '📅', title: '智能训练计划', desc: '根据目标自动生成多周计划' },
  { icon: '🔔', title: '主动提醒', desc: '智能推送饮水、运动、称重提醒' },
  { icon: '📋', title: '营养报告导出', desc: '导出每周/每月营养分析报告' },
];

export default function MembershipPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold tracking-tight text-dark">会员中心</h1>
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white shadow-glow">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[15px] font-bold">小燃AI</span>
          </div>
          <p className="text-[13px] opacity-90 mt-1">当前所有功能免费开放</p>
        </div>
      </div>

      <div className="premium-card rounded-3xl p-5">
        <h3 className="text-[13px] font-semibold text-dark mb-4">功能列表</h3>
        {FEATURES.map(f => (
          <div key={f.title} className="flex items-center gap-3 py-3 border-b border-black/[0.03] last:border-0">
            <span className="text-[18px]">{f.icon}</span>
            <div>
              <p className="text-[13px] font-semibold text-dark">{f.title}</p>
              <p className="text-[11px] text-muted">{f.desc}</p>
            </div>
            <span className="ml-auto text-[11px] text-green-600 font-semibold">可用</span>
          </div>
        ))}
      </div>
    </div>
  );
}
