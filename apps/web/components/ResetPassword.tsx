import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, Leaf, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface ResetPasswordProps {
  token: string;
  onComplete: () => void;
}

// Reset-password page reached from the emailed link
// (${FRONTEND_URL}/reset-password?token=). Mirrors VerifyEmail's styling.
const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'form' | 'submitting' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setMessage('');
    setStatus('submitting');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Your password has been reset.');
        setTimeout(() => onComplete(), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'This reset link is invalid or has expired.');
      }
    } catch (error) {
      console.error('Reset error:', error);
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full bg-[#3a5a40] flex flex-col items-center justify-center p-8 text-white" style={{ height: 'var(--app-height, 100dvh)' }}>
      <div className="mb-12 text-center">
        <div className="bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl inline-block mb-4 shadow-2xl">
          <Leaf size={64} className="text-[#a3b18a]" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Dayla</h1>
        <p className="text-[#a3b18a] font-medium tracking-widest uppercase text-xs mt-2">Explore Together</p>
      </div>

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Set a new password</h2>

        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <p className="text-green-200 mb-4">{message}</p>
            <p className="text-white/60 text-sm">Redirecting to sign in...</p>
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-6">
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-200 mb-6">{message}</p>
            <button
              onClick={onComplete}
              className="w-full bg-[#a3b18a] hover:bg-[#588157] text-[#3a5a40] font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg active:scale-95"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-11 text-white placeholder-white/50 focus:outline-none focus:border-[#a3b18a]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                tabIndex={-1}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#a3b18a]"
            />
            {message && <p className="text-red-200 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-[#a3b18a] hover:bg-[#588157] disabled:bg-stone-400 text-[#3a5a40] font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="w-full text-center text-sm text-[#a3b18a] hover:underline"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
