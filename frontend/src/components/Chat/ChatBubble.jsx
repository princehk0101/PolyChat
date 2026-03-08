import React, { useState } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';

export default function ChatBubble({ msg, isMe }) {
  const [showNuance, setShowNuance] = useState(false);

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-up`}>
      <div
        className={`relative max-w-[92%] sm:max-w-[82%] md:max-w-[70%] p-3 sm:p-4 rounded-2xl border ${isMe
          ? 'bg-accent-700 text-white border-accent-700 rounded-tr-md'
          : 'bg-white text-ink-950 border-accent-100 rounded-tl-md'
          }`}
      >
        <p className="text-sm sm:text-[15px] leading-relaxed">{msg.content}</p>

        <div className={`my-2 border-t ${isMe ? 'border-white/20' : 'border-accent-100'}`} />

        <div className={`flex items-start gap-2 text-xs sm:text-sm ${isMe ? 'text-blue-100' : 'text-ink-600'} italic`}>
          <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>{msg.translatedContent}</p>
        </div>

        {msg.nuance && (
          <div className="absolute -top-2 -right-2 z-20">
            <button
              onMouseEnter={() => setShowNuance(true)}
              onMouseLeave={() => setShowNuance(false)}
              className="w-5 h-5 rounded-full bg-amber-400 border-2 border-white shadow"
              aria-label="Nuance alert"
            />

            {showNuance && (
              <div className="absolute bottom-full right-0 mb-2 w-64 max-w-[calc(100vw-2rem)] p-3 rounded-xl bg-white border border-amber-200 shadow-lg text-xs text-amber-700 leading-relaxed z-50 animate-fade-up">
                <div className="flex items-center gap-2 mb-1.5 font-bold uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Nuance Alert
                </div>
                {msg.nuance}
              </div>
            )}
          </div>
        )}
      </div>

      <span className="text-[10px] uppercase tracking-wider text-ink-400 mt-1 mx-1">
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
