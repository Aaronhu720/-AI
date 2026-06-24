import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const quickQuestions = [
  { text: '我今天吃多了怎么办？', icon: '🍔' },
  { text: '晚上饿了能吃什么？', icon: '🌙' },
  { text: '帮我安排明天的饮食', icon: '📋' },
  { text: '我只有15分钟怎么练？', icon: '⏱' },
  { text: '平台期了怎么办？', icon: '📊' },
  { text: '奶茶喝了怎么补救？', icon: '🧋' },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是小燃，你的AI减脂教练\n\n有任何关于减脂、饮食、运动的问题都可以问我。我会根据你的身体数据给出个性化建议。',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post<{ reply: string }>('/coach/chat', { message: text.trim() });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      if (import.meta.env.DEV) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '这是一个模拟回复。在连接后端后，AI教练会根据你的饮食、运动和身体数据给出个性化的建议。\n\n目前建议：\n1. 保持每日热量在1200-1500kcal\n2. 蛋白质摄入不低于体重(kg)×1.2g\n3. 每周至少运动3次，每次30分钟以上',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '抱歉，我暂时无法回复，请稍后再试。',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
      <h1 className="text-[22px] font-bold tracking-tight text-dark pb-3">AI教练</h1>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4 no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-warm flex items-center justify-center shrink-0 mt-0.5 shadow-glow-sm">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[78%] px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-warm text-white rounded-2xl rounded-br-lg shadow-glow-sm'
                : 'premium-card rounded-2xl rounded-bl-lg'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-xl bg-warm flex items-center justify-center shrink-0 mt-0.5 shadow-glow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="premium-card rounded-2xl rounded-bl-lg px-4 py-3 flex items-center gap-1.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {quickQuestions.map(q => (
            <button
              key={q.text}
              onClick={() => sendMessage(q.text)}
              className="premium-card px-3.5 py-2 rounded-2xl text-[11px] font-medium text-dark flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="text-[13px]">{q.icon}</span>
              {q.text}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pb-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            className="w-full px-4 py-3.5 premium-card rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-primary/20 transition-all border-0"
            placeholder="问AI教练任何减脂问题..."
            disabled={loading}
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-12 h-12 bg-warm text-white rounded-2xl flex items-center justify-center shadow-glow-sm disabled:opacity-40 active:scale-95 transition-all shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
