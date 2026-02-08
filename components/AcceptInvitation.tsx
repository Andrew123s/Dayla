import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Leaf } from 'lucide-react';
import { User } from '../types';

interface AcceptInvitationProps {
  invitationId: string;
  user: User | null;
  onLoginRequired: () => void;
  onComplete: () => void;
}

const AcceptInvitation: React.FC<AcceptInvitationProps> = ({ 
  invitationId, 
  user, 
  onLoginRequired, 
  onComplete 
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login-required'>('loading');
  const [message, setMessage] = useState('');
  const [dashboardName, setDashboardName] = useState('');

  const API_BASE_URL = '';

  useEffect(() => {
    if (!user) {
      setStatus('login-required');
      setMessage('Please log in to accept this invitation');
    } else {
      acceptInvitation();
    }
  }, [invitationId, user]);

  const acceptInvitation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/boards/invitations/${invitationId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Invitation accepted successfully!');
        setDashboardName(data.data?.dashboard?.name || 'the dashboard');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to accept invitation. The link may be invalid or expired.');
      }
    } catch (error) {
      console.error('Accept invitation error:', error);
      setStatus('error');
      setMessage('An error occurred while accepting the invitation. Please try again.');
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
        <h2 className="text-2xl font-bold mb-6 text-center">Dashboard Invitation</h2>

        {status === 'loading' && (
          <div className="text-center py-8">
            <Loader size={48} className="text-[#a3b18a] animate-spin mx-auto mb-4" />
            <p className="text-white/80">Accepting invitation...</p>
          </div>
        )}

        {status === 'login-required' && (
          <div className="text-center py-8">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
              <p className="text-yellow-200 mb-4">{message}</p>
            </div>
            <button
              onClick={onLoginRequired}
              className="w-full bg-[#a3b18a] hover:bg-[#588157] text-[#3a5a40] font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg active:scale-95"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <p className="text-green-200 mb-2">{message}</p>
            {dashboardName && (
              <p className="text-white/80 text-sm mb-4">
                You now have access to "{dashboardName}"
              </p>
            )}
            <p className="text-white/60 text-sm">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-200 mb-6">{message}</p>
            <button
              onClick={onComplete}
              className="w-full text-center text-sm text-[#a3b18a] hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation;
