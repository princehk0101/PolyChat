import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Languages, Menu, X, LogOut, Settings, UserCircle2, ChevronDown } from 'lucide-react';
import Button from '../UI/Button';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, currentUser } = useAuth();

  const avatarSrc = currentUser?.profile_pic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.username || 'User')}`;
  const displayName = useMemo(() => currentUser?.name || currentUser?.full_name || currentUser?.username || 'User', [currentUser]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setProfileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-accent-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent-700 text-white flex items-center justify-center">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <p className="text-ink-950 font-bold leading-tight">PolyChat</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-500">Realtime Multilingual</p>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive
                  ? 'bg-accent-700 text-white'
                  : 'text-ink-600 hover:bg-accent-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/chat">
                <Button className="text-sm px-4">Workspace</Button>
              </NavLink>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-accent-100 bg-white px-3 py-2 text-left shadow-sm"
                >
                  <img src={avatarSrc} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-accent-100" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-ink-950 max-w-36 truncate">{displayName}</p>
                    <p className="text-xs text-ink-500 max-w-36 truncate">@{currentUser?.username}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-ink-500" />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-accent-100 bg-white p-2 shadow-lg">
                    <NavLink
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-accent-50"
                    >
                      <UserCircle2 className="w-4 h-4" />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-accent-50"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <Button variant="ghost" className="text-sm px-4">Sign In</Button>
              </NavLink>
              <NavLink to="/signup">
                <Button className="text-sm px-4">Get Started</Button>
              </NavLink>
            </>
          )}
        </div>

        <button
          className="md:hidden w-10 h-10 rounded-lg border border-accent-100 bg-white text-ink-700 flex items-center justify-center"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-accent-100 bg-white/95">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive
                    ? 'bg-accent-700 text-white'
                    : 'text-ink-600 hover:bg-accent-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <NavLink to="/chat" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full text-sm">Workspace</Button>
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" className="w-full text-sm inline-flex items-center justify-center gap-1">
                      <UserCircle2 className="w-4 h-4" />
                      Profile
                    </Button>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" className="w-full text-sm">Sign In</Button>
                  </NavLink>
                  <NavLink to="/signup" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full text-sm">Get Started</Button>
                  </NavLink>
                </>
              )}
            </div>
            {isAuthenticated && (
              <>
                <div className="mt-3 rounded-2xl border border-accent-100 bg-white px-3 py-3 flex items-center gap-3">
                  <img src={avatarSrc} alt={displayName} className="w-11 h-11 rounded-full object-cover border border-accent-100" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-950 truncate">{displayName}</p>
                    <p className="text-xs text-ink-500 truncate">@{currentUser?.username}</p>
                  </div>
                </div>
                <NavLink
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 hover:bg-accent-100 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
