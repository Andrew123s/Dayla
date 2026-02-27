
import React, { useState } from 'react';
import { User } from '../types';
import { Compass, Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous messages
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    let responseData: any = null;

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      console.log('Making API call to:', `${API_BASE_URL}${endpoint}`);
      console.log('Payload:', payload);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in request/response
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      responseData = data;
      console.log('Response data:', data);

      if (!response.ok) {
        // Check if error response includes verification requirement
        if (data.requiresVerification && data.email) {
          setUserEmail(data.email);
          setShowResendButton(true);
        }
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.success) {
        if (data.requiresVerification) {
          // Registration successful but requires email verification
          setSuccess(data.message);
          setUserEmail(data.data.email);
          setShowResendButton(true);
          // Clear form
          setFormData({ name: '', email: '', password: '' });
        } else {
          // Login successful - Token is now stored in HTTP-only cookie by the server
          console.log('Authentication successful, calling onLogin with user:', data.data.user);
          // Call onLogin with user data - this will trigger navigation in App.tsx
          onLogin(data.data.user);
        }
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setSuccess('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#3a5a40] flex flex-col items-center justify-center p-8 text-white">
      <div className="mb-12 text-center animate-bounce">
        <div className="bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl inline-block mb-4 shadow-2xl">
            <Leaf size={64} className="text-[#a3b18a]" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Dayla</h1>
        <p className="text-[#a3b18a] font-medium tracking-widest uppercase text-xs mt-2">Explore Together</p>
      </div>

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span className="text-red-200 text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-green-200 text-sm">{success}</span>
            </div>
            {showResendButton && (
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="text-xs text-green-300 hover:text-green-100 underline mt-2"
              >
                Didn't receive it? Resend verification email
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required={!isLogin}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#a3b18a] focus:border-[#a3b18a] placeholder-stone-300 transition-colors"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#a3b18a] focus:border-[#a3b18a] placeholder-stone-300 transition-colors"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#a3b18a] focus:border-[#a3b18a] placeholder-stone-300 transition-colors"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#a3b18a] hover:bg-[#588157] disabled:bg-stone-400 text-[#3a5a40] font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg mt-4 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#3a5a40] border-t-transparent rounded-full animate-spin"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Join the Wild'
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
            setShowResendButton(false);
            setUserEmail('');
            setFormData({ name: '', email: '', password: '' });
          }}
          disabled={isLoading}
          className="w-full text-center text-xs mt-6 text-[#a3b18a] hover:underline disabled:opacity-50"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already a member? Sign in"}
        </button>
      </div>

      <p className="mt-12 text-[10px] text-stone-400 font-medium max-w-[200px] text-center leading-relaxed">
        By continuing, you agree to our Nature-First Community Guidelines & Terms of Service.
      </p>
    </div>
  );
};

export default AuthView;
