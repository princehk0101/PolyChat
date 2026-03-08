import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/UI/GlassCard';
import Button from '../components/UI/Button';
import { authApi, normalizeApiError } from '../services/api';
import { User, Mail, Globe, Edit3, Calendar, Settings } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        setUser(res.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-ink-500">Loading profile...</div>;
  if (error) return <div className="flex justify-center items-center min-h-[60vh] text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto p-4 pt-10 max-w-4xl">
      <GlassCard className="relative overflow-hidden p-0">
        <div className="h-32 bg-gradient-to-r from-accent-500 to-accent-700"></div>
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-6 gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
               <img src={user.profile_pic || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 mb-2">
               <h1 className="text-2xl font-bold text-ink-950">{user.name || user.full_name || user.username}</h1>
               <p className="text-sm text-ink-500">@{user.username}</p>
               <p className="text-ink-500">{user.email}</p>
            </div>
            <div className="mb-2 flex gap-2">
              <Link to="/profile/edit">
                <Button variant="secondary" className="flex items-center gap-2 text-sm">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4" /> Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
             <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">About</h3>
                <div className="flex items-center gap-3 text-ink-600"><User className="w-4 h-4 text-accent-500" /> <span>{user.name || user.full_name || user.username}</span></div>
                <div className="flex items-center gap-3 text-ink-600"><User className="w-4 h-4 text-accent-500" /> <span>@{user.username}</span></div>
                <div className="flex items-center gap-3 text-ink-600"><Mail className="w-4 h-4 text-accent-500" /> <span>{user.email}</span></div>
                <div className="flex items-center gap-3 text-ink-600"><Calendar className="w-4 h-4 text-accent-500" /> <span>Joined recently</span></div>
             </div>
             <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Workspace</h3>
                <div className="flex items-center gap-3 text-ink-600"><Globe className="w-4 h-4 text-accent-500" /> <span>PolyChat Workspace</span></div>
                <div className="flex items-center gap-3 text-ink-600"><Globe className="w-4 h-4 text-accent-500" /> <span>{user.language ? user.language.toUpperCase() : 'EN'} (Preferred)</span></div>
                <div className="flex items-center gap-3 text-ink-600"><Settings className="w-4 h-4 text-accent-500" /> <span>Profile and settings linked from navbar</span></div>
             </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Profile;
