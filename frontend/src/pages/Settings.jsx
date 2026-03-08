import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/UI/GlassCard';
import Button from '../components/UI/Button';
import { authApi, normalizeApiError } from '../services/api';
import { Languages, Save, UserCircle2 } from 'lucide-react';

const Settings = () => {
  const [languages, setLanguages] = useState([]);
  const [currentLang, setCurrentLang] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [langRes, userRes] = await Promise.all([
          authApi.getLanguages(),
          authApi.getCurrentUser()
        ]);
        setLanguages(langRes.data);
        setUser(userRes.data);
        setCurrentLang(userRes.data.language || 'en');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await authApi.setLanguage(currentLang);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage(normalizeApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-ink-500">Loading settings...</div>;

  return (
    <div className="container mx-auto p-4 pt-10 max-w-3xl">
      <GlassCard className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-950 mb-6">Settings</h1>
        
        <div className="space-y-8">
          <section className="bg-white/50 p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.profile_pic || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}`}
                alt={user?.username || 'User'}
                className="w-14 h-14 rounded-full object-cover border border-accent-100"
              />
              <div className="min-w-0">
                <p className="font-semibold text-ink-950 truncate">{user?.name || user?.full_name || user?.username}</p>
                <p className="text-sm text-ink-500 truncate">@{user?.username}</p>
              </div>
            </div>
            <Link to="/profile/edit">
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <UserCircle2 className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
          </section>

          {/* Language Settings */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-accent-600" /> Language Preference
            </h2>
            <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
              <label className="block text-sm font-medium text-ink-700 mb-2">Translation Language</label>
              <p className="text-xs text-ink-500 mb-3">Messages you receive will be translated to this language.</p>
              <select 
                value={currentLang} 
                onChange={(e) => setCurrentLang(e.target.value)}
                className="w-full sm:w-64 p-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </section>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
