import React, { useMemo, useState } from 'react';
import { Search, Globe2 } from 'lucide-react';

export default function Sidebar({ users, onSelectUser, selectedUser }) {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      `${user.username} ${user.displayName} ${user.region} ${user.nativeLanguage}`
        .toLowerCase()
        .includes(needle)
    );
  }, [searchTerm, users]);

  return (
    <div className="surface-card h-full flex flex-col p-3 sm:p-4 overflow-hidden">
      <div className="relative mb-3 sm:mb-4">
        <input
          placeholder="Search teammates..."
          className="w-full bg-white border border-accent-100 rounded-xl pl-10 pr-3 py-2.5 text-sm text-ink-950 placeholder:text-ink-400 focus:outline-none focus:border-accent-500/70 focus:ring-2 focus:ring-accent-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
      </div>

      <div className="text-[11px] sm:text-xs font-semibold text-ink-500 uppercase tracking-widest mb-2 sm:mb-3 flex items-center justify-between">
        <span>People Directory</span>
        <Globe2 className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {results.length > 0 ? (
          results.map((user) => {
            const active = selectedUser?.uid === user.uid;
            return (
              <button
                key={user.uid}
                onClick={() => onSelectUser(user)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all border ${active
                  ? 'bg-accent-100 border-accent-300'
                  : 'bg-white border-transparent hover:border-accent-200 hover:bg-accent-50'
                  }`}
              >
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-11 h-11 rounded-full object-cover border border-accent-200"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950 truncate">{user.displayName}</p>
                  <p className="text-xs text-ink-500 truncate">
                    @{user.username} | {user.nativeLanguage.toUpperCase()} | {user.region}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-sm text-ink-500 text-center py-8">No users found for this search.</div>
        )}
      </div>
    </div>
  );
}
