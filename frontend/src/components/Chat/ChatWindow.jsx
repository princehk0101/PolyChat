import React, { useEffect, useRef, useState } from 'react';
import { Send, Globe2, Sparkles, Bot } from 'lucide-react';
import ChatBubble from './ChatBubble';

export default function ChatWindow({ user, messages, currentUserId = 'self-001', onSendMessage }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    await onSendMessage(input.trim());
    setInput('');
    setSending(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-3 sm:p-5 border-b border-accent-100 bg-white/70 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-11 h-11 rounded-full object-cover border border-accent-200"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-ink-950 truncate">{user.displayName}</h2>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-ink-500 uppercase tracking-wider truncate">
              <Globe2 className="w-3.5 h-3.5" />
              {user.nativeLanguage.toUpperCase()} | {user.region} | {user.role}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-accent-100 text-accent-700">
          <Bot className="w-3.5 h-3.5" />
          Live Translation + Nuance
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-4 sm:py-5 space-y-4 bg-gradient-to-b from-white/40 to-accent-50/45">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} isMe={msg.senderID === currentUserId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 border-t border-accent-100 bg-white/75 backdrop-blur-md">
        <form onSubmit={handleSend} className="surface-card p-2 flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 bg-transparent px-1 sm:px-2 py-2 text-sm text-ink-950 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-accent-700 hover:bg-accent-600 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
