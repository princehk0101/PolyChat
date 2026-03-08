import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/UI/GlassCard';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { KeyRound, ArrowLeft, Info } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Reset link has been sent to your email address.');
  };

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <GlassCard className="max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-ink-950">Reset Password</h1>
          <p className="text-ink-600 mt-2">Submit your email to simulate reset flow.</p>

          {message && (
            <div className="mt-5 rounded-xl border border-accent-200 bg-accent-100 text-ink-700 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-7">
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full py-3">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-white border border-accent-100 px-3 py-2 text-xs text-ink-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-accent-700" />
            You can continue presentation by opening the dashboard directly.
          </div>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-ink-600 hover:text-accent-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
