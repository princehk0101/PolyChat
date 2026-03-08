import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tokenStore, authApi, normalizeApiError } from '../services/api';
import Button from './UI/Button';
import { User, LogOut, MessageSquare, Settings, Edit3 } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    if (tokenStore.getAccess()) {
      try {
        const res = await authApi.getProfile();
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", normalizeApiError(err));
        // Agar token expire ho gaya hai ya invalid hai
        tokenStore.clear();
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();

    // Login/Logout events ko sunna
    const handleAuthChange = () => fetchUser();
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API failed", err);
    }
    tokenStore.clear(); // Yeh 'auth-change' event trigger karega
    navigate('/login');
  };

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <Link to={user ? "/chat" : "/"} className="text-2xl font-bold text-ink-900 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
        </div>
        <span className="hidden sm:inline">
          {user ? `${user.username}'s Workspace` : 'PolyChat'}
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-accent-100 border border-accent-200 flex items-center justify-center text-accent-700 hover:bg-accent-200 transition-colors overflow-hidden">
                    {user.profile_pic ? (
                        <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/profile/edit" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </Link>
                        <Link to="/settings" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Settings
                        </Link>
                    </div>
                    <div className="py-1 border-t border-gray-100">
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-ink-600 hover:text-accent-600 font-medium px-2">Sign In</Link>
            <Link to="/signup"><Button>Get Started</Button></Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;