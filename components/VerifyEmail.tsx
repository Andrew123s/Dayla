import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Leaf } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface VerifyEmailProps {
  token: string;
  onComplete: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, onComplete }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);



  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      // Extract email from URL or prompt user
      const email = prompt('Please enter your email address to resend the verification link:');
      if (!email) {
        setIsResending(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Verification email sent! Please check your inbox.');
        setStatus('success');
      } else {
        setMessage(data.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#3a5a40] flex flex-col items-center justify-center p-8 text-white">
      <div className="mb-12 text-center">
        <div className="bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl inline-block mb-4 shadow-2xl">
          <Leaf size={64} className="text-[#a3b18a]" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Dayla</h1>
        <p className="text-[#a3b18a] font-medium tracking-widest uppercase text-xs mt-2">Explore Together</p>
      </div>

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>

        {status === 'loading' && (
          <div className="text-center py-8">
            <Loader size={48} className="text-[#a3b18a] animate-spin mx-auto mb-4" />
            <p className="text-white/80">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <p className="text-green-200 mb-4">{message}</p>
            <p className="text-white/60 text-sm">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-200 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full bg-[#a3b18a] hover:bg-[#588157] disabled:bg-stone-400 text-[#3a5a40] font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#3a5a40] border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              <button
                onClick={onComplete}
                className="w-full text-center text-sm text-[#a3b18a] hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
