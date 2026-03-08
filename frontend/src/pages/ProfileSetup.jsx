import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/UI/GlassCard';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { UserCircle2, Globe, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LANGUAGE_OPTIONS = ['en', 'hi', 'es', 'fr', 'de', 'pt', 'ja'];
const REGIONS = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];

export default function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [region, setRegion] = useState('Asia');
  const [teamRole, setTeamRole] = useState('Product Manager');
  const [languageOptions] = useState(LANGUAGE_OPTIONS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await updateCurrentUser({
        username: username.trim(),
        language: nativeLanguage,
      });
      localStorage.setItem(
        'polychat_profile',
        JSON.stringify({ username, teamRole, nativeLanguage, region })
      );
      navigate('/chat');
    } catch (err) {
      setError(err?.response?.data?.username?.[0] || 'Unable to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = currentUser?.username || currentUser?.email || username;

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <GlassCard className="p-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1300&q=80"
            alt="Profile preferences setup"
            className="w-full h-64 lg:h-full object-cover"
          />
        </GlassCard>

        <GlassCard className="max-w-xl w-full mx-auto">
          <h1 className="text-3xl font-bold text-ink-950">Profile Setup</h1>
          <p className="text-ink-600 mt-2">
            Finalize your preferences before entering workspace.
          </p>
          {displayName && (
            <p className="text-xs text-ink-500 mt-1">
              Current account: <span className="font-semibold">{displayName}</span>
            </p>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-7">
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-500 mb-2 flex items-center gap-2">
                <UserCircle2 className="w-4 h-4" />
                Identity
              </div>
              <Input
                label="Username"
                placeholder="e.g. anita.sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Role"
                placeholder="e.g. Product Manager"
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-ink-500 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </div>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full bg-white/85 border border-accent-100 rounded-xl px-4 py-2.5 text-ink-950 focus:outline-none focus:border-accent-500/70 focus:ring-2 focus:ring-accent-500/20 transition-all"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-ink-500 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Region
                </div>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white/85 border border-accent-100 rounded-xl px-4 py-2.5 text-ink-950 focus:outline-none focus:border-accent-500/70 focus:ring-2 focus:ring-accent-500/20 transition-all"
                >
                  {REGIONS.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full py-3 inline-flex items-center justify-center gap-2" disabled={loading}>
              <Sparkles className="w-4 h-4" />
              Save and Open Workspace
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
