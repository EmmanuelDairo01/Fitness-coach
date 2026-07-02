import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

export default function AICoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { messages: history } = await api.get('/api/coach/history');
      if (history.length) {
        setMessages(history);
      } else {
        const { tips } = await api.get('/api/coach/insights');
        const intro =
          tips && tips.length
            ? `Hey! Here are a few things I'm seeing in your logs:\n\n${tips.map((t) => `• ${t}`).join('\n')}\n\nWant me to build you a plan?`
            : "Hey! I'm Coach, your AI training partner. Log a workout or a meal and I'll start spotting patterns to help you improve.";
        setMessages([{ role: 'assistant', content: intro, created_at: new Date().toISOString() }]);
      }
      setLoadingHistory(false);
    }
    init().catch(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text, created_at: new Date().toISOString() }]);
    setSending(true);
    try {
      const { reply } = await api.post('/api/coach/chat', { message: text });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, created_at: new Date().toISOString() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}`, created_at: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="font-display text-xl font-semibold">AI Coach</h1>
        <div className="w-9 h-9 rounded-full bg-volt flex items-center justify-center">
          <Bot size={16} />
        </div>
      </div>

      <div className="screen-content px-5">
        {loadingHistory ? (
          <p className="text-sm text-muted text-center py-12">Loading conversation...</p>
        ) : (
          <div className="space-y-3 pb-2">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && <Bubble role="assistant" content="Thinking..." muted />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="absolute left-0 right-0 px-4 py-3 bg-card border-t border-line flex items-center gap-2"
        style={{ bottom: 76 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 card px-4 py-2.5 text-sm outline-none"
        />
        <button type="submit" disabled={sending} className="w-10 h-10 rounded-full btn-primary flex items-center justify-center">
          <Send size={15} />
        </button>
      </form>

      <BottomNav />
    </div>
  );
}

function Bubble({ role, content, muted }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-snug ${
          isUser ? 'bg-ink text-paper rounded-br-sm' : 'bg-card border border-line rounded-bl-sm'
        } ${muted ? 'text-muted' : ''}`}
      >
        {content}
      </div>
    </div>
  );
}
