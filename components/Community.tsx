
import React, { useState, useRef, useEffect } from 'react';
import { User, Post } from '../types';
import { Heart, MessageCircle, MapPin, Share, Save, Plus, Image as ImageIcon, X, Send, AlertCircle, CheckCircle, Loader, UserPlus } from 'lucide-react';
import { initializeSocket, getSocket } from '../lib/socket';
import { API_BASE_URL } from '../lib/api';

interface CommunityProps {
  user: User;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    content: '',
    location: '',
    title: '',
    image: null as File | null,
    imagePreview: null as string | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]
      || localStorage.getItem('auth_token')
      || localStorage.getItem('dayla_token');
    if (token) {
      initializeSocket(token);
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('post:created');
        socket.off('post:liked');
        socket.off('comment:added');
        socket.off('trip:saved');
        socket.off('friend:request_sent');
      }
    };
  }, []);

  // Listen for real-time events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('post:created', (data: any) => {
      console.log('New post created:', data);
      fetchPosts(); // Refresh posts
    });

    socket.on('post:liked', (data: any) => {
      console.log('Post liked:', data);
      setPosts(prev => prev.map(post => 
        (post._id || post.id) === data.postId
          ? { ...post, likeCount: data.likeCount }
          : post
      ));
    });

    socket.on('comment:added', (data: any) => {
      console.log('Comment added:', data);
      setPosts(prev => prev.map(post =>
        (post._id || post.id) === data.postId
          ? { ...post, comments: [...(post.comments || []), data.comment] }
          : post
      ));
    });

    socket.on('trip:saved', (data: any) => {
      console.log('Trip saved:', data);
    });

    socket.on('friend:request_sent', (data: any) => {
      console.log('Friend request sent:', data);
    });

    return () => {
      socket.off('post:created');
      socket.off('post:liked');
      socket.off('comment:added');
      socket.off('trip:saved');
      socket.off('friend:request_sent');
    };
  }, []);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
        credentials: 'include', // Use cookie-based auth
      });

      const data = await response.json();
      console.log('Fetched posts:', data);

      if (data.success) {
        setPosts(data.data.posts);
      } else {
        setError('Failed to load posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prev => prev.map(post =>
          (post._id || post.id) === postId
            ? { ...post, likeCount: data.data.likeCount, liked: data.data.liked }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    setActivePostId(postId);
    setShowCommentModal(true);
    setCommentText('');
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activePostId || commentingPostId) return;

    setCommentingPostId(activePostId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts/${activePostId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: commentText.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setShowCommentModal(false);
        setCommentText('');
        fetchPosts(); // Refresh to get updated comments
      } else {
        setError(data.message || 'Failed to add comment');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleSaveTrip = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
        setPosts(prev => prev.map(post =>
          (post._id || post.id) === postId
            ? { ...post, saved: data.data.saved }
            : post
        ));
      }
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleSendFriendRequest = async (authorId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/friend-request/${authorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Friend request sent!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPost(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handlePost = async () => {
    if (!newPost.content.trim()) {
      setError('Please add some content to your post');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!newPost.location.trim()) {
      setError('Please add a location to your post');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setPosting(true);
    setError('');

    try {
      let imageUrl = null;

      // Upload image first if provided
      if (newPost.image) {
        const formData = new FormData();
        formData.append('files', newPost.image);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload/documents`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.data.files.length > 0) {
          imageUrl = uploadData.data.files[0].url;
        }
      }

      // Create post with proper structure
      const postData: any = {
        content: newPost.content.trim(),
        location: {
          name: newPost.location.trim()
        }
      };

      if (newPost.title) {
        postData.title = newPost.title.trim();
      }

      if (imageUrl) {
        postData.images = [{ url: imageUrl }];
      }

      console.log('Creating post with data:', postData);

      const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      console.log('Post creation response:', data);

      if (data.success) {
        // Refresh posts to include the new one
        await fetchPosts();
        setShowPostModal(false);
        setNewPost({ content: '', location: '', title: '', image: null, imagePreview: null });
        setSuccessMessage('Post created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to create post');
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.map((e: any) => e.message).join(', '));
        }
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setPosting(false);
    }
  };

  const removeImage = () => {
    if (newPost.imagePreview) {
      URL.revokeObjectURL(newPost.imagePreview);
    }
    setNewPost(prev => ({ ...prev, image: null, imagePreview: null }));
  };

  // Cleanup object URLs when modal closes
  useEffect(() => {
    return () => {
      if (newPost.imagePreview) {
        URL.revokeObjectURL(newPost.imagePreview);
      }
    };
  }, [newPost.imagePreview]);

  return (
    <div className="h-full flex flex-col bg-[#f7f3ee] relative">
      {/* Success Message */}
      {successMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg max-w-sm">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <header className="p-4 bg-white border-b border-stone-200 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#3a5a40]">Community</h1>
        <p className="text-sm text-stone-500">Discover new trails & experiences</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-stone-500">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin"></div>
              <span>Loading posts...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-stone-400" />
              </div>
              <p className="text-stone-600 font-medium mb-2">No posts yet</p>
              <p className="text-stone-500 text-sm">Be the first to share your adventure!</p>
            </div>
          </div>
        ) : (
          posts.map((post) => {
            const postId = (post as any)._id || post.id;
            const author = (post as any).author;
            const authorId = author?._id || author?.id;
            const authorName = author?.name || 'Unknown User';
            const authorAvatar = author?.avatar || '';
            const locationName = (post as any).location?.name || 'Unknown Location';
            const postImages = (post as any).images || [];
            const mainImage = postImages.length > 0 ? postImages[0].url : '';
            const likeCount = (post as any).likeCount ?? (Array.isArray((post as any).likes) ? (post as any).likes.length : 0);
            const comments = (post as any).comments || [];
            const isLiked = (post as any).liked || false;
            const isSaved = (post as any).saved || false;
            const isFriend = false; // TODO: Check from user's friends list
            const isOwnPost = authorId === user.id;

            return (
              <div key={postId} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {authorAvatar ? (
                      <img src={authorAvatar} className="w-10 h-10 rounded-full object-cover" alt={authorName} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#a3b18a] flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{authorName?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-stone-800">{authorName}</h3>
                      <div className="flex items-center gap-1 text-[#588157]">
                        <MapPin size={12} />
                        <span className="text-[10px] font-medium">{locationName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSaveTrip(postId)}
                      className={`p-2 rounded-xl transition-colors ${
                        isSaved 
                          ? 'bg-[#3a5a40] text-white' 
                          : 'bg-[#fefae0] text-[#3a5a40] hover:bg-[#faedcd]'
                      }`}
                    >
                      <Save size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                    {!isOwnPost && !isFriend && (
                      <button
                        onClick={() => handleSendFriendRequest(authorId)}
                        className="p-2 bg-[#fefae0] text-[#3a5a40] rounded-xl hover:bg-[#3a5a40] hover:text-white transition-colors"
                      >
                        <UserPlus size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Image */}
                {mainImage && (
                  <img src={mainImage} className="w-full aspect-[4/3] object-cover" alt="Post content" />
                )}

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-stone-700 leading-relaxed mb-4">{post.content}</p>
                  
                  <div className="flex items-center gap-6 text-stone-500">
                    <button 
                      onClick={() => handleLike(postId)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                      <span className="text-xs font-bold">{likeCount}</span>
                    </button>
                    <button 
                      onClick={() => handleComment(postId)}
                      className="flex items-center gap-1 hover:text-[#3a5a40] transition-colors"
                    >
                      <MessageCircle size={20} />
                      <span className="text-xs font-bold">{comments.length}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-[#3a5a40] ml-auto">
                      <Share size={20} />
                    </button>
                  </div>

                  {comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-50 space-y-2">
                      {comments.slice(0, 3).map((c: any) => (
                        <div key={c.id || c._id} className="text-[11px]">
                          <span className="font-bold mr-2 text-stone-800">
                            {c.author?.name || 'Unknown'}
                          </span>
                          <span className="text-stone-600">{c.content}</span>
                        </div>
                      ))}
                      {comments.length > 3 && (
                        <button 
                          onClick={() => handleComment(postId)}
                          className="text-[10px] text-[#3a5a40] font-bold"
                        >
                          View all {comments.length} comments
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Post Button */}
      <button
        onClick={() => {
          setShowPostModal(true);
          setError('');
        }}
        className="absolute bottom-20 right-4 w-14 h-14 bg-[#3a5a40] text-white rounded-full shadow-lg hover:bg-[#588157] transition-all duration-200 flex items-center justify-center z-20 hover:scale-105"
      >
        <Plus size={24} />
      </button>

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#3a5a40]">Create Post</h2>
                <button
                  onClick={() => setShowPostModal(false)}
                  disabled={posting}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={posting}
                    className="w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#3a5a40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {newPost.imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={newPost.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          disabled={posting}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-stone-400" />
                        <span className="text-sm text-stone-500">Add image from your travels</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={posting}
                    className="hidden"
                  />
                </div>

                {/* Title Input (Optional) */}
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  disabled={posting}
                  className="w-full p-3 bg-stone-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#3a5a40] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Location Input */}
                <input
                  type="text"
                  placeholder="Location (required, e.g., Yosemite National Park)"
                  value={newPost.location}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                  disabled={posting}
                  required
                  className="w-full p-3 bg-stone-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#3a5a40] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Content Input */}
                <textarea
                  placeholder="Share your experience... (required)"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  disabled={posting}
                  required
                  className="w-full p-3 bg-stone-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#3a5a40] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={4}
                />

                {/* Post Button */}
                <button
                  onClick={handlePost}
                  disabled={!newPost.content.trim() || !newPost.location.trim() || posting}
                  className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-bold hover:bg-[#588157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {posting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800">Add Comment</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full p-3 bg-stone-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#3a5a40] resize-none"
                rows={4}
                autoFocus
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim() || !!commentingPostId}
                className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-bold hover:bg-[#588157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {commentingPostId ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
