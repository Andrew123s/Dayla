
import React, { useState, useRef, useEffect } from 'react';
import { User, Conversation, Message } from '../types';
import { Search, Send, Plus, Image as ImageIcon, Phone, MoreVertical, Smile, Mic, Paperclip, Sticker, FileText, Gift, MessageCircle, AlertCircle, X, Users, UserPlus, CheckCircle } from 'lucide-react';
import { initializeSocket, getSocket, joinConversation, leaveConversation, sendMessage as sendSocketMessage, startTyping, stopTyping } from '../lib/socket';
import { API_BASE_URL } from '../lib/api';

interface ChatViewProps {
  user: User;
}

const ChatView: React.FC<ChatViewProps> = ({ user }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [groupInviteLink, setGroupInviteLink] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newChatFriends, setNewChatFriends] = useState<any[]>([]);
  const [loadingNewChatFriends, setLoadingNewChatFriends] = useState(false);
  const [creatingDirectChat, setCreatingDirectChat] = useState(false);
  const [groupFriends, setGroupFriends] = useState<any[]>([]);
  const [loadingGroupFriends, setLoadingGroupFriends] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    // Get token from cookies (httpOnly cookies are sent automatically on API requests,
    // but for socket auth we need a readable token — try auth_token or dayla_token)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]
      || localStorage.getItem('auth_token')
      || localStorage.getItem('dayla_token');

    if (token) {
      const socket = initializeSocket(token);

      // Listen for new messages
      socket.on('new_message', (messageData: any) => {
        // Add message to active chat if it matches
        if (messageData.conversationId === activeChatId) {
          setActiveChatMessages(prev => [...prev, messageData]);
          // Scroll to bottom
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }

        // Update conversation list with last message
        setConversations(prev =>
          prev.map(conv =>
            (conv._id || conv.id) === messageData.conversationId
              ? { ...conv, lastMessage: messageData, updatedAt: messageData.createdAt }
              : conv
          )
        );
      });

      // Listen for typing indicators
      socket.on('user_typing', (data: any) => {
        if (data.conversationId === activeChatId) {
          setTypingUsers(prev => new Set(prev).add(data.userName));
        }
      });

      socket.on('user_stopped_typing', (data: any) => {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userName);
          return updated;
        });
      });

      // Listen for user presence updates
      socket.on('user_joined', (data: any) => {
        console.log('User joined:', data);
      });

      socket.on('user_left', (data: any) => {
        console.log('User left:', data);
      });

      // Listen for group profile updates
      socket.on('group:profile_updated', (data: any) => {
        console.log('Group profile updated:', data);
        // Update conversation in state
        setConversations(prev =>
          prev.map(conv =>
            (conv._id || conv.id) === data.conversationId
              ? { ...conv, name: data.name, avatar: data.avatar, updatedAt: data.timestamp }
              : conv
          )
        );
        // Update active chat if it's the same conversation
        if (data.conversationId === activeChatId) {
          fetchConversations(); // Refresh to get updated data
        }
      });

      // Listen for group member joined
      socket.on('group:member_joined', (data: any) => {
        console.log('Group member joined:', data);
        if (data.conversationId === activeChatId) {
          // Refresh conversation data
          fetchConversations();
        }
      });

      // Listen for group member added
      socket.on('group:member_added', (data: any) => {
        console.log('Group member added:', data);
        if (data.conversationId === activeChatId) {
          // Refresh conversation data
          fetchConversations();
        }
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
        socket.off('user_joined');
        socket.off('user_left');
        socket.off('group:profile_updated');
        socket.off('group:member_joined');
        socket.off('group:member_added');
      }
    };
  }, [activeChatId]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        credentials: 'include', // Use cookie-based auth
      });

      const data = await response.json();

      if (data.success) {
        setConversations(data.data.conversations);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        credentials: 'include', // Use cookie-based auth
      });

      const data = await response.json();

      if (data.success) {
        // Backend returns newest-first; reverse so oldest appears at top, newest at bottom
        setActiveChatMessages((data.data.messages || []).reverse());
        // Scroll to bottom after loading
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 150);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch messages and join conversation room when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      joinConversation(activeChatId);
    }

    // Leave previous conversation room on cleanup
    return () => {
      if (activeChatId) {
        leaveConversation(activeChatId);
        stopTyping(activeChatId);
      }
    };
  }, [activeChatId]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
        setShowGroupMenu(false);
      }
    };

    if (showPlusMenu || showGroupMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlusMenu, showGroupMenu]);

  const activeChat = conversations.find(c => (c._id || c.id) === activeChatId);

  // Handle sending message
  const handleSendMessage = () => {
    if (!message.trim() || !activeChatId || sending) return;

    setSending(true);
    sendSocketMessage({
      conversationId: activeChatId,
      content: message.trim(),
      messageType: 'text'
    });

    setMessage('');
    setSending(false);
    stopTyping(activeChatId);
  };

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!activeChatId) return;

    // Start typing indicator
    startTyping(activeChatId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeChatId);
    }, 2000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check if user is group admin
  const isGroupAdmin = () => {
    if (!activeChat || !activeChat.isGroup) return false;
    const participant = activeChat.participants.find(
      p => (p.user?._id || (p.user as any)?.id) === user.id
    );
    return participant?.role === 'admin';
  };

  // Handle edit group profile
  const handleEditGroup = () => {
    if (!activeChat || !activeChat.isGroup) return;
    setEditGroupName(activeChat.name || '');
    setShowGroupMenu(false);
    setError('');
    setSuccessMessage('');
    setShowEditGroupModal(true);
  };

  // Handle save group profile
  const handleSaveGroupProfile = async () => {
    if (!activeChatId || !editGroupName.trim() || editingGroup) return;

    console.log('Saving group profile:', { conversationId: activeChatId, name: editGroupName.trim() });
    setEditingGroup(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editGroupName.trim() })
      });

      const data = await response.json();
      console.log('Update group response:', data);

      if (data.success) {
        setShowEditGroupModal(false);
        setError('');
        setSuccessMessage('Group profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Immediately update local state
        setConversations(prev =>
          prev.map(conv =>
            (conv._id || conv.id) === activeChatId
              ? { ...conv, name: editGroupName.trim() }
              : conv
          )
        );
      } else {
        setError(data.message || 'Failed to update group');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
    } finally {
      setEditingGroup(false);
    }
  };

  // Handle group avatar upload
  const handleGroupAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeChatId}/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        setSuccessMessage('Group avatar updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Update will be handled by WebSocket event
      } else {
        setError(data.message || 'Failed to upload avatar');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar');
    }
  };

  // Handle share group link
  const handleShareLink = async () => {
    if (!activeChatId) return;

    setShowGroupMenu(false);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeChatId}/invite-link`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const fullLink = `${window.location.origin}/join/${data.data.inviteCode}`;
        setGroupInviteLink(fullLink);
        setShowShareLinkModal(true);
        console.log('group:link_generated', { conversationId: activeChatId, inviteLink: fullLink });
      } else {
        setError(data.message || 'Failed to generate invite link');
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      setError('Failed to generate invite link');
    }
  };

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupInviteLink);
    setSuccessMessage('Link copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Handle add members
  const handleAddMembers = async () => {
    setShowGroupMenu(false);
    setError('');
    setSuccessMessage('');
    setLoadingFriends(true);
    setShowAddMembersModal(true);
    setSelectedFriends(new Set());

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/friends`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Filter out users who are already in the group
        const existingMemberIds = activeChat?.participants.map(p => p.user?._id || (p.user as any)?.id) || [];
        const availableFriends = data.data.friends.filter(
          (friend: any) => !existingMemberIds.includes(friend._id)
        );
        setFriends(availableFriends);
      } else {
        setError('Failed to load friends');
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      setError('Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  // Toggle friend selection
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => {
      const updated = new Set(prev);
      if (updated.has(friendId)) {
        updated.delete(friendId);
      } else {
        updated.add(friendId);
      }
      return updated;
    });
  };

  // Add selected members to group
  const handleAddSelectedMembers = async () => {
    if (!activeChatId || selectedFriends.size === 0 || addingMembers) return;

    console.log('Adding members to group:', { conversationId: activeChatId, memberIds: Array.from(selectedFriends) });
    setAddingMembers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeChatId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userIds: Array.from(selectedFriends) })
      });

      const data = await response.json();
      console.log('Add members response:', data);

      if (data.success) {
        setShowAddMembersModal(false);
        setSelectedFriends(new Set());
        setError('');
        setSuccessMessage(`Added ${data.data.addedUsers.length} member(s) successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh conversations to get updated participant list
        fetchConversations();
      } else {
        setError(data.message || 'Failed to add members');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error adding members:', error);
      setError('Failed to add members');
    } finally {
      setAddingMembers(false);
    }
  };

  // Fetch friends for new chat modal
  const fetchNewChatFriends = async () => {
    setLoadingNewChatFriends(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/friends`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setNewChatFriends(data.data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends for new chat:', error);
    } finally {
      setLoadingNewChatFriends(false);
    }
  };

  // Fetch friends for group creation modal
  const fetchGroupFriends = async () => {
    setLoadingGroupFriends(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/friends`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setGroupFriends(data.data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends for group:', error);
    } finally {
      setLoadingGroupFriends(false);
    }
  };

  // Start a direct conversation with a friend
  const startDirectChat = async (friendId: string, friendName: string) => {
    if (creatingDirectChat) return;
    setCreatingDirectChat(true);
    try {
      // Check if conversation already exists with this friend
      const existing = conversations.find(conv =>
        !conv.isGroup && conv.participants.some(
          p => (p.user?._id || (p.user as any)?.id) === friendId
        )
      );
      if (existing) {
        setActiveChatId(existing._id || existing.id);
        setShowNewChatModal(false);
        return;
      }

      // Create new direct conversation
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: friendName,
          isGroup: false,
          participants: [friendId],
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchConversations();
        setActiveChatId(data.data.conversation._id || data.data.conversation.id);
        setShowNewChatModal(false);
      } else {
        setError(data.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting direct chat:', error);
      setError('Failed to start conversation');
    } finally {
      setCreatingDirectChat(false);
    }
  };

  // Toggle group member selection
  const toggleGroupMember = (friendId: string) => {
    setSelectedGroupMembers(prev => {
      const updated = new Set(prev);
      if (updated.has(friendId)) {
        updated.delete(friendId);
      } else {
        updated.add(friendId);
      }
      return updated;
    });
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
    setShowPlusMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && activeChatId) {
      try {
        const formData = new FormData();

        // Add all selected files
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/api/upload/documents`, {
          method: 'POST',
          credentials: 'include', // Use cookie-based auth
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          // Files uploaded successfully - you could show a success message
          console.log('Files uploaded:', data.data);
        } else {
          setError('Failed to upload files');
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        setError('Failed to upload files');
      }
    }
  };

  if (activeChat) {
    return (
      <div className="h-full flex flex-col bg-white relative">
        {/* Success Message */}
        {successMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-down">
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-down">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <header className="p-4 border-b border-stone-100 flex items-center justify-between">
          <button onClick={() => setActiveChatId(null)} className="text-[#3a5a40] font-bold text-sm">← Back</button>
          <div className="flex flex-col items-center">
            <h2 className="text-sm font-bold text-stone-800">
              {activeChat.isGroup
                ? activeChat.name
                : (() => {
                    // For direct chats, show the OTHER participant, not the current user
                    const other = activeChat.participants.find(
                      p => (p.user?._id || (p.user as any)?.id) !== user.id
                    );
                    return other?.user?.name || (other as any)?.name || activeChat.name || 'Unknown';
                  })()
              }
            </h2>
            <span className="text-[10px] text-green-500 font-bold">Online</span>
          </div>
          <div className="relative">
            {activeChat.isGroup && (
              <>
                <button 
                  onClick={() => setShowGroupMenu(!showGroupMenu)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                
                {/* Group Menu Dropdown */}
                {showGroupMenu && (
                  <div 
                    ref={groupMenuRef}
                    className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-stone-200 w-56 z-50 overflow-hidden"
                  >
                    {isGroupAdmin() && (
                      <button
                        onClick={handleEditGroup}
                        className="w-full px-4 py-3 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                      >
                        <Users size={18} className="text-[#3a5a40]" />
                        <span>Edit Group Profile</span>
                      </button>
                    )}
                    <button
                      onClick={handleAddMembers}
                      className="w-full px-4 py-3 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors border-t border-stone-100"
                    >
                      <UserPlus size={18} className="text-[#3a5a40]" />
                      <span>Add Members</span>
                    </button>
                    <button
                      onClick={handleShareLink}
                      className="w-full px-4 py-3 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors border-t border-stone-100"
                    >
                      <UserPlus size={18} className="text-[#3a5a40]" />
                      <span>Share Group Link</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-stone-500">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin"></div>
                <span>Loading messages...</span>
              </div>
            </div>
          ) : activeChatMessages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-stone-400" />
                </div>
                <p className="text-stone-600 font-medium mb-2">No messages yet</p>
                <p className="text-stone-500 text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            activeChatMessages.map(m => {
              const isMe = m.sender?._id === user.id;
              return (
                <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isMe ? '' : 'flex gap-2'}`}>
                    {/* Show avatar for other users in group chats */}
                    {!isMe && activeChat.isGroup && (
                      <div className="flex-shrink-0 mt-1">
                        {m.sender?.avatar ? (
                          <img src={m.sender.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white text-[10px] font-bold">
                            {m.sender?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      {/* Show sender name in group chats */}
                      {!isMe && activeChat.isGroup && m.sender?.name && (
                        <p className="text-[10px] font-semibold text-stone-500 mb-0.5 ml-1">{m.sender.name}</p>
                      )}
                      <div className={`p-3 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-[#3a5a40] text-white rounded-tr-none'
                          : 'bg-stone-100 text-stone-800 rounded-tl-none'
                      }`}>
                        {m.content}
                        <div className={`text-[9px] mt-1 ${isMe ? 'text-white/60' : 'text-stone-400'}`}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Plus Menu Pop-up */}
        {showPlusMenu && (
          <div 
            ref={menuRef}
            className="absolute bottom-36 left-4 bg-white rounded-3xl shadow-2xl border border-stone-100 p-4 w-72 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setError('Emoji picker coming soon!'); setShowPlusMenu(false); }}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-stone-50 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shadow-sm">
                  <Smile size={22} />
                </div>
                <span className="text-[10px] font-bold text-stone-500">Emoji</span>
              </button>
              <button
                onClick={() => { setError('Stickers coming soon!'); setShowPlusMenu(false); }}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-stone-50 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <Sticker size={22} />
                </div>
                <span className="text-[10px] font-bold text-stone-500">Sticker</span>
              </button>
              <button
                onClick={() => { setError('GIF picker coming soon!'); setShowPlusMenu(false); }}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-stone-50 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <Gift size={22} />
                </div>
                <span className="text-[10px] font-bold text-stone-500">GIF</span>
              </button>
              <button
                onClick={() => { setError('Voice recording coming soon!'); setShowPlusMenu(false); }}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-stone-50 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm">
                  <Mic size={22} />
                </div>
                <span className="text-[10px] font-bold text-stone-500">Record</span>
              </button>
              <button 
                onClick={handleFileAttach}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-stone-50 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 bg-green-100 text-[#3a5a40] rounded-full flex items-center justify-center shadow-sm">
                  <Paperclip size={22} />
                </div>
                <span className="text-[10px] font-bold text-stone-500">File</span>
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf,.docx,.doc"
              multiple
            />
          </div>
        )}

        <div className="p-4 border-t border-stone-100 bg-white pb-24">
          {typingUsers.size > 0 && (
            <div className="text-xs text-stone-500 mb-2 px-2">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={`p-2 transition-all duration-200 ${showPlusMenu ? 'bg-[#3a5a40] text-white rotate-45' : 'text-[#3a5a40] bg-[#a3b18a]/10'} rounded-full`}
            >
              <Plus size={20} />
            </button>
            <input 
              type="text" 
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 bg-stone-50 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#3a5a40] disabled:opacity-50"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              className="p-2 text-white bg-[#3a5a40] rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#588157] transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Edit Group Profile Modal */}
        {showEditGroupModal && activeChat.isGroup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-800">Edit Group Profile</h2>
                <button 
                  onClick={() => setShowEditGroupModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Group Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {activeChat.avatar ? (
                      <img
                        src={activeChat.avatar}
                        className="w-24 h-24 rounded-full object-cover border-4 border-stone-100"
                        alt="Group Avatar"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white font-bold text-3xl border-4 border-stone-100">
                        {activeChat.name?.[0]?.toUpperCase() || 'G'}
                      </div>
                    )}
                    <button
                      onClick={() => groupAvatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-[#3a5a40] text-white p-2 rounded-full shadow-lg hover:bg-[#588157] transition-colors"
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>
                  <input
                    ref={groupAvatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGroupAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-stone-500 text-center">Click the camera icon to change group photo</p>
                </div>

                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    placeholder="Enter group name"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveGroupProfile}
                  disabled={!editGroupName.trim() || editingGroup}
                  className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-medium hover:bg-[#588157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingGroup ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Group Link Modal */}
        {showShareLinkModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-800">Invite to Group</h2>
                <button 
                  onClick={() => setShowShareLinkModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-sm text-stone-600 mb-3">Share this link to invite people to join the group:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={groupInviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-[#3a5a40] text-white rounded-lg text-sm font-medium hover:bg-[#588157] transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Anyone with this link can request to join the group. The link will work only for users who have an account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Members Modal */}
        {showAddMembersModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[80vh] overflow-hidden animate-slide-up flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-800">Add Members</h2>
                <button 
                  onClick={() => setShowAddMembersModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-stone-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Friends List */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingFriends ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-stone-500">
                      <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin"></div>
                      <span>Loading friends...</span>
                    </div>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-600 font-medium mb-1">No friends available</p>
                    <p className="text-stone-500 text-sm">All your friends are already in this group</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends
                      .filter(friend => 
                        !friendSearchQuery || 
                        friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                        friend.email.toLowerCase().includes(friendSearchQuery.toLowerCase())
                      )
                      .map(friend => (
                        <button
                          key={friend._id}
                          onClick={() => toggleFriendSelection(friend._id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            selectedFriends.has(friend._id)
                              ? 'bg-[#3a5a40] text-white'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                          }`}
                        >
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              className="w-12 h-12 rounded-full object-cover"
                              alt={friend.name}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white font-semibold">
                              {friend.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{friend.name}</p>
                            <p className="text-xs opacity-75">{friend.email}</p>
                          </div>
                          {selectedFriends.has(friend._id) && (
                            <CheckCircle size={20} />
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              {friends.length > 0 && (
                <div className="p-4 border-t border-stone-100">
                  <button
                    onClick={handleAddSelectedMembers}
                    disabled={selectedFriends.size === 0 || addingMembers}
                    className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-medium hover:bg-[#588157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingMembers ? 'Adding...' : `Add ${selectedFriends.size} ${selectedFriends.size === 1 ? 'Member' : 'Members'}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f7f3ee]">
      <header className="p-4 bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#3a5a40]">Messages</h1>
          <button 
            onClick={() => { setShowNewChatModal(true); fetchNewChatFriends(); }}
            className="p-2 bg-[#3a5a40] text-white rounded-full hover:bg-[#588157] transition-colors active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input 
            type="text" 
            placeholder="Search friends or groups..." 
            className="w-full bg-stone-50 border-none rounded-2xl pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-stone-500">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin"></div>
              <span>Loading conversations...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Error loading conversations</p>
              <p className="text-stone-500 text-sm mb-4">{error}</p>
              <button
                onClick={fetchConversations}
                className="px-4 py-2 bg-[#3a5a40] text-white rounded-lg hover:bg-[#588157] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-stone-400" />
              </div>
              <p className="text-stone-600 font-medium mb-2">No conversations yet</p>
              <p className="text-stone-500 text-sm">Start a conversation to connect with fellow adventurers!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Group Chats Section */}
            {conversations.filter(conv => conv.isGroup).length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Group Chats
                </div>
                {conversations.filter(conv => conv.isGroup).map(conv => {
                  const convId = conv._id || conv.id;
                  const timeString = conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString() : '';
                  const validAvatar = conv.avatar && !conv.avatar.includes('picsum.photos') ? conv.avatar : null;
                  
                  return (
                    <button
                      key={convId}
                      onClick={() => setActiveChatId(convId)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white rounded-2xl transition-all"
                    >
                      <div className="relative">
                        {validAvatar ? (
                          <img
                            src={validAvatar}
                            className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                            alt="Group Chat"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white font-semibold text-xl shadow-sm">
                            {conv.name?.[0]?.toUpperCase() || 'G'}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-sm font-bold text-stone-800">{conv.name}</h3>
                          {timeString && <span className="text-[10px] text-stone-400">{timeString}</span>}
                        </div>
                        <p className="text-xs text-stone-500 truncate">
                          {conv.lastMessage
                            ? (typeof conv.lastMessage === 'object' && (conv.lastMessage as any)?.content
                              ? `${(conv.lastMessage as any)?.sender?.name ? (conv.lastMessage as any).sender.name + ': ' : ''}${(conv.lastMessage as any).content}`
                              : 'Sent a message')
                            : 'Start a conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Personal Chats Section */}
            {conversations.filter(conv => !conv.isGroup).length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mt-4">
                  Personal Chats
                </div>
                {conversations.filter(conv => !conv.isGroup).map(conv => {
                  const convId = conv._id || conv.id;
                  // Show the OTHER participant, not the current user
                  const otherParticipant = conv.participants.find(
                    p => (p.user?._id || (p.user as any)?.id) !== user.id
                  ) || conv.participants[0];
                  const participant = otherParticipant;
                  const participantName = participant?.user?.name || (participant as any)?.name || 'Unknown';
                  const participantAvatar = participant?.user?.avatar || (participant as any)?.avatar || null;
                  const validAvatar = participantAvatar && !participantAvatar.includes('picsum.photos') ? participantAvatar : null;
                  const timeString = conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString() : '';
                  
                  return (
                    <button
                      key={convId}
                      onClick={() => setActiveChatId(convId)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white rounded-2xl transition-all"
                    >
                      <div className="relative">
                        {validAvatar ? (
                          <img
                            src={validAvatar}
                            className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                            alt="Personal Chat"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white font-semibold text-xl shadow-sm">
                            {participantName[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-sm font-bold text-stone-800">{participantName}</h3>
                          {timeString && <span className="text-[10px] text-stone-400">{timeString}</span>}
                        </div>
                        <p className="text-xs text-stone-500 truncate">
                          {conv.lastMessage
                            ? (typeof conv.lastMessage === 'object' && (conv.lastMessage as any)?.content
                              ? (conv.lastMessage as any).content
                              : 'Sent a message')
                            : 'Start a conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">New Message</h2>
              <button 
                onClick={() => { setShowNewChatModal(false); setSearchQuery(''); }}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4 flex flex-col flex-1 min-h-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#3a5a40] focus:border-[#3a5a40] outline-none"
                />
              </div>
              
              <div className="space-y-2 mb-4">
                <button 
                  onClick={() => {
                    setShowNewChatModal(false);
                    setShowCreateGroupModal(true);
                    setSelectedGroupMembers(new Set());
                    fetchGroupFriends();
                    setError('');
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users size={24} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-800">Create Group Chat</p>
                    <p className="text-xs text-stone-500">Chat with multiple friends</p>
                  </div>
                </button>
              </div>
              
              <p className="text-xs text-stone-400 uppercase font-bold mb-3">Friends</p>
              
              <div className="space-y-2 max-h-[40vh] overflow-y-auto flex-1">
                {loadingNewChatFriends ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-stone-500">
                      <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin"></div>
                      <span className="text-sm">Loading friends...</span>
                    </div>
                  </div>
                ) : newChatFriends.filter(f =>
                    !searchQuery || f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                      <Users size={32} className="text-stone-400" />
                    </div>
                    <p className="text-stone-600 font-medium mb-1">No friends found</p>
                    <p className="text-stone-400 text-sm max-w-[200px]">
                      {searchQuery ? `No results for "${searchQuery}"` : 'Add friends to start chatting!'}
                    </p>
                  </div>
                ) : (
                  newChatFriends
                    .filter(f =>
                      !searchQuery || f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(friend => (
                      <button
                        key={friend._id}
                        onClick={() => startDirectChat(friend._id, friend.name)}
                        disabled={creatingDirectChat}
                        className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {friend.avatar ? (
                          <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" alt={friend.name} />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white font-semibold text-lg">
                            {friend.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="text-left flex-1">
                          <p className="font-medium text-stone-800 text-sm">{friend.name}</p>
                          <p className="text-xs text-stone-500">{friend.email}</p>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Chat Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Create Group Chat</h2>
              <button 
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setGroupName('');
                  setSelectedGroupMembers(new Set());
                  setError('');
                }}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 flex-1 min-h-0 overflow-y-auto">
              {/* Error Message */}
              {error && showCreateGroupModal && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <span className="text-red-600 text-sm">{error}</span>
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Group Name Input */}
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">Group Name</label>
                <input 
                  type="text"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter group name..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3a5a40] focus:border-[#3a5a40] outline-none"
                />
              </div>

              {/* Add Members Section */}
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Add Members {selectedGroupMembers.size > 0 && <span className="text-[#3a5a40]">({selectedGroupMembers.size} selected)</span>}
                </label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
                  {loadingGroupFriends ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3 text-stone-500">
                        <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin"></div>
                        <span className="text-sm">Loading friends...</span>
                      </div>
                    </div>
                  ) : groupFriends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center px-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-3">
                        <UserPlus size={24} className="text-stone-400" />
                      </div>
                      <p className="text-stone-500 text-sm">No friends to add yet</p>
                      <p className="text-stone-400 text-xs mt-1">Add friends first to create a group</p>
                    </div>
                  ) : (
                    <div className="max-h-[30vh] overflow-y-auto divide-y divide-stone-100">
                      {groupFriends.map(friend => (
                        <button
                          key={friend._id}
                          onClick={() => toggleGroupMember(friend._id)}
                          className={`w-full flex items-center gap-3 p-3 transition-colors ${
                            selectedGroupMembers.has(friend._id) ? 'bg-[#3a5a40]/10' : 'hover:bg-white'
                          }`}
                        >
                          {friend.avatar ? (
                            <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover" alt={friend.name} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white font-semibold">
                              {friend.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-stone-800 text-sm">{friend.name}</p>
                            <p className="text-xs text-stone-500">{friend.email}</p>
                          </div>
                          {selectedGroupMembers.has(friend._id) && (
                            <CheckCircle size={20} className="text-[#3a5a40]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={async () => {
                  if (!groupName.trim()) {
                    setError('Please enter a group name');
                    return;
                  }
                  
                  setCreatingGroup(true);
                  try {
                    const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: groupName,
                        isGroup: true,
                        participants: Array.from(selectedGroupMembers),
                      }),
                    });

                    const data = await response.json();

                    if (data.success) {
                      fetchConversations();
                      setShowCreateGroupModal(false);
                      setGroupName('');
                      setSelectedGroupMembers(new Set());
                      // Open the new group chat
                      const newConvId = data.data.conversation._id || data.data.conversation.id;
                      if (newConvId) setActiveChatId(newConvId);
                    } else {
                      setError(data.message || 'Failed to create group');
                    }
                  } catch (err) {
                    console.error('Create group error:', err);
                    setError('Failed to create group chat');
                  } finally {
                    setCreatingGroup(false);
                  }
                }}
                disabled={creatingGroup || !groupName.trim()}
                className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-bold hover:bg-[#588157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {creatingGroup ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Users size={18} />
                    Create Group{selectedGroupMembers.size > 0 ? ` (${selectedGroupMembers.size} members)` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatView;
