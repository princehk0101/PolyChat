import React, { useEffect, useState } from 'react';
import GlassCard from '../components/UI/GlassCard';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { authApi, normalizeApiError } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ProfileEdit = () => {
  const { updateCurrentUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('en');
  const [profilePic, setProfilePic] = useState('');
  const [languages, setLanguages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, languageRes] = await Promise.all([
          authApi.getCurrentUser(),
          authApi.getLanguages(),
        ]);
        setFullName(userRes.data.full_name || userRes.data.name || '');
        setUsername(userRes.data.username || '');
        setLanguage(userRes.data.language || 'en');
        setProfilePic(userRes.data.profile_pic || '');
        setLanguages(languageRes.data || []);
      } catch (err) {
        setMessage(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePic(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateCurrentUser({ full_name: fullName, username, language, profile_pic: profilePic });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(normalizeApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-10">
        <GlassCard>
          <p className="text-ink-600">Loading profile editor...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-10">
      <GlassCard>
        <h1 className="text-2xl font-bold text-ink-950">Edit Profile</h1>
        <p className="text-ink-600 mt-2">Update your workspace identity and preferred language.</p>
        {message && (
          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${message.includes('successfully') ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md">
          <div className="flex items-center gap-4">
            <img
              src={profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${username || 'User'}`}
              alt={username || 'User'}
              className="w-20 h-20 rounded-full object-cover border border-accent-100"
            />
            <label className="text-sm font-medium text-ink-700">
              Profile Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block text-sm" disabled={saving} />
            </label>
          </div>
          <Input
            label="Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={saving}
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={saving}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink-700 ml-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={saving}
              className="bg-white/85 border border-accent-100 rounded-xl px-4 py-2.5 text-ink-950 focus:outline-none focus:border-accent-500/70 focus:ring-2 focus:ring-accent-500/20 transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default ProfileEdit;
