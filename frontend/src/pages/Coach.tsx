import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const quickQuestions = [
  '我今天吃多了怎么办？',
  '晚上饿了能吃什么？',
  '帮我安排明天的饮食',
  '我只有15分钟怎么练？',
  '平台期了怎么办？',
  '奶茶喝了怎么补救？',
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是小燃，你的AI减脂教练 🔥\n\n有任何关于减脂、饮食、运动的问题都可以问我。我会根据你的身体数据给出个性化建议。',
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
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回复，请稍后再试。',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <h1 className="text-xl font-bold pb-3">AI教练</h1>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-card border border-border rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted">
              思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 bg-card border border-border rounded-full text-xs text-muted"
            >{q}</button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          className="flex-1 px-4 py-3 border border-border rounded-xl bg-card text-sm"
          placeholder="问AI教练任何减脂问题..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >发送</button>
      </div>
    </div>
  );
}
