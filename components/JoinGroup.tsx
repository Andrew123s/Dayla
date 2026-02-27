import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface JoinGroupProps {
  inviteCode: string;
}

const JoinGroup: React.FC<JoinGroupProps> = ({ inviteCode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    checkAuthAndJoin();
  }, [inviteCode]);

  const checkAuthAndJoin = async () => {
    try {
      // Check if user is authenticated
      const authResponse = await fetch(`${API_BASE_URL}/api/auth/check`, {
        credentials: 'include'
      });

      const authData = await authResponse.json();

      if (!authData.success || !authData.data?.user) {
        // User not logged in - redirect to signup/login
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // User is logged in - attempt to join
      const joinResponse = await fetch(`${API_BASE_URL}/api/chat/join/${inviteCode}`, {
        method: 'POST',
        credentials: 'include'
      });

      const joinData = await joinResponse.json();

      if (joinData.success) {
        setGroupName(joinData.data.conversation?.name || 'the group');
        setSuccess(true);
        // Redirect to chat after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(joinData.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Store invite code in session storage to redirect back after login
    sessionStorage.setItem('pendingInvite', inviteCode);
    window.location.href = '/login';
  };

  const handleSignup = () => {
    // Store invite code in session storage to redirect back after signup
    sessionStorage.setItem('pendingInvite', inviteCode);
    window.location.href = '/signup';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ee] to-[#e8dcc4] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#3a5a40] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Joining Group...</h2>
          <p className="text-stone-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ee] to-[#e8dcc4] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#588157] to-[#3a5a40] rounded-full flex items-center justify-center">
            <Users size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3 text-center">Join Group Chat</h2>
          <p className="text-stone-600 mb-6 text-center">
            You've been invited to join a group! Please sign in or create an account to continue.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-medium hover:bg-[#588157] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleSignup}
              className="w-full py-3 bg-white text-[#3a5a40] border-2 border-[#3a5a40] rounded-xl font-medium hover:bg-stone-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ee] to-[#e8dcc4] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">Welcome!</h2>
          <p className="text-stone-600 mb-6">
            You've successfully joined <strong>{groupName}</strong>
          </p>
          <p className="text-sm text-stone-500">Redirecting to chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ee] to-[#e8dcc4] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">Oops!</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-medium hover:bg-[#588157] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default JoinGroup;
