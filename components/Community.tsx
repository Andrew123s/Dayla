
import React, { useState, useRef, useEffect } from 'react';
import { User, Post } from '../types';
import { Heart, MessageCircle, MapPin, Share, Save, Plus, Image as ImageIcon, X, Send, Loader, UserPlus, MoreVertical, Trash2, Pencil, Repeat2 } from 'lucide-react';
import { initializeSocket, getSocket } from '../lib/socket';
import { API_BASE_URL, authFetch } from '../lib/api';

interface CommunityProps {
  user: User;
  onFriendRequestSent?: () => void;
}

const Community: React.FC<CommunityProps> = ({ user, onFriendRequestSent }) => {
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
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setError('');
    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts`);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response');
      }

      const data = await response.json();

      if (data.success) {
        setPosts(Array.isArray(data.data?.posts) ? data.data.posts : []);
      } else {
        throw new Error(data.message || 'Failed to load posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts/${postId}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    const postIdToComment = activePostId;
    const text = commentText.trim();
    setCommentingPostId(postIdToComment);

    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts/${postIdToComment}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        setShowCommentModal(false);
        setCommentText('');
        setActivePostId(null);
        await fetchPosts();
      } else {
        setError(data.message || data.error || 'Failed to add comment');
        setTimeout(() => setError(''), 4000);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to add comment');
      setTimeout(() => setError(''), 4000);
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleSaveTrip = async (postId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await authFetch(`${API_BASE_URL}/api/auth/friend-request/${authorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Friend request sent!');
        setTimeout(() => setSuccessMessage(''), 3000);
        onFriendRequestSent?.();
      } else {
        setError(data.message || 'Failed to send friend request');
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
      let imageUrl: string | null = null;

      if (newPost.image) {
        try {
          const formData = new FormData();
          formData.append('image', newPost.image);

          const uploadResponse = await authFetch(`${API_BASE_URL}/api/upload/images`, {
            method: 'POST',
            body: formData,
          });

          const uploadContentType = uploadResponse.headers.get('content-type') || '';
          if (!uploadContentType.includes('application/json')) {
            console.error('Image upload returned non-JSON:', uploadResponse.status);
          } else {
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.data?.url) {
              imageUrl = uploadData.data.url;
            } else {
              console.warn('Image upload failed:', uploadData.message);
            }
          }
        } catch (uploadErr) {
          console.warn('Image upload error (proceeding without image):', uploadErr);
        }
      }

      const postData: any = {
        content: newPost.content.trim(),
        location: {
          name: newPost.location.trim()
        }
      };

      if (newPost.title?.trim()) {
        postData.title = newPost.title.trim();
      }

      if (imageUrl) {
        postData.images = [{ url: imageUrl }];
      }

      // If editing and no new image was uploaded, keep the existing one
      if (editingPostId && !imageUrl && existingImageUrl) {
        postData.images = [{ url: existingImageUrl }];
      }

      const isEditing = !!editingPostId;
      const url = isEditing
        ? `${API_BASE_URL}/api/community/posts/${editingPostId}`
        : `${API_BASE_URL}/api/community/posts`;
      const method = isEditing ? 'PUT' : 'POST';

      console.log(`${isEditing ? 'Updating' : 'Creating'} post with data:`, postData);

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server error (${response.status}). Please try again.`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchPosts();
        setShowPostModal(false);
        setEditingPostId(null);
        setExistingImageUrl(null);
        setNewPost({ content: '', location: '', title: '', image: null, imagePreview: null });
        setSuccessMessage(isEditing ? 'Post updated!' : 'Post created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const msg = data.errors && Array.isArray(data.errors)
          ? data.errors.map((e: any) => e.message).join(', ')
          : (data.message || data.error || 'Failed to create post');
        setError(msg);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setPosting(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuPostId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuPostId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuPostId]);

  const handleDeletePost = (postId: string) => {
    setOpenMenuPostId(null);
    setShowDeleteConfirm(postId);
  };

  const confirmDeletePost = async () => {
    if (!showDeleteConfirm) return;
    setDeleting(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts/${showDeleteConfirm}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => ((p as any)._id || p.id) !== showDeleteConfirm));
        setSuccessMessage('Post deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to delete post');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Delete post error:', err);
      setError('Failed to delete post');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleEditPost = (post: any) => {
    setOpenMenuPostId(null);
    const postId = post._id || post.id;
    const images = post.images || [];
    const firstImageUrl = images.length > 0 ? images[0].url : null;

    setEditingPostId(postId);
    setExistingImageUrl(firstImageUrl);
    setNewPost({
      content: post.content || '',
      location: post.location?.name || '',
      title: post.title || '',
      image: null,
      imagePreview: firstImageUrl,
    });
    setShowPostModal(true);
    setError('');
  };

  const handleRepost = async (post: any) => {
    setOpenMenuPostId(null);
    const originalPostId = post._id || post.id;
    const originalAuthor = post.author;
    const originalAuthorId = originalAuthor?._id || originalAuthor?.id;
    const originalAuthorName = originalAuthor?.name || 'Unknown';

    setPosting(true);
    try {
      const postData: any = {
        content: post.content,
        location: post.location || { name: 'Shared' },
        images: (post.images || []).map((img: any) => ({ url: img.url })),
        repostedFrom: {
          post: originalPostId,
          author: originalAuthorId,
          authorName: originalAuthorName,
        },
      };
      if (post.title) postData.title = post.title;

      const response = await authFetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPosts();
        setSuccessMessage('Reposted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to repost');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Repost error:', err);
      setError('Failed to repost');
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

                    {/* 3-dot menu */}
                    <div className="relative" ref={openMenuPostId === postId ? menuRef : undefined}>
                      <button
                        onClick={() => setOpenMenuPostId(openMenuPostId === postId ? null : postId)}
                        className="p-2 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuPostId === postId && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-stone-100 py-1 z-30 overflow-hidden">
                          {isOwnPost && (
                            <>
                              <button
                                onClick={() => handleEditPost(post)}
                                className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                              >
                                <Pencil size={15} className="text-stone-500" />
                                Edit Post
                              </button>
                              <button
                                onClick={() => handleDeletePost(postId)}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 size={15} />
                                Delete Post
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleRepost(post)}
                            disabled={posting}
                            className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors disabled:opacity-50"
                          >
                            <Repeat2 size={15} className="text-stone-500" />
                            Repost
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Repost attribution */}
                {(post as any).repostedFrom?.authorName && (
                  <div className="px-4 py-2 bg-stone-50 border-y border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                    <Repeat2 size={13} />
                    <span>Reposted from <span className="font-bold text-stone-700">{(post as any).repostedFrom.authorName}</span></span>
                  </div>
                )}

                {/* Post Image */}
                {mainImage && (
                  <img src={mainImage} className="w-full max-h-[500px] object-contain bg-stone-100" alt="Post content" />
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

                  {/* Inline comment input */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 text-xs bg-stone-50 rounded-full px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3a5a40]"
                      value={activePostId === postId ? commentText : ''}
                      onChange={(e) => {
                        setActivePostId(postId);
                        setCommentText(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && commentText.trim() && activePostId === postId) {
                          submitComment();
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (activePostId === postId && commentText.trim()) {
                          submitComment();
                        } else {
                          handleComment(postId);
                        }
                      }}
                      disabled={activePostId === postId && commentingPostId === postId}
                      className="p-2 bg-[#3a5a40] text-white rounded-full hover:bg-[#588157] transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {commentingPostId === postId ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Post Button */}
      <button
        onClick={() => {
          setEditingPostId(null);
          setExistingImageUrl(null);
          setNewPost({ content: '', location: '', title: '', image: null, imagePreview: null });
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
                <h2 className="text-xl font-bold text-[#3a5a40]">{editingPostId ? 'Edit Post' : 'Create Post'}</h2>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setEditingPostId(null);
                    setExistingImageUrl(null);
                    setNewPost({ content: '', location: '', title: '', image: null, imagePreview: null });
                  }}
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
                    className={`w-full border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#3a5a40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${newPost.imagePreview ? '' : 'h-32'}`}
                  >
                    {newPost.imagePreview ? (
                      <div className="relative w-full">
                        <img
                          src={newPost.imagePreview}
                          alt="Preview"
                          className="w-full max-h-48 object-contain rounded-xl"
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
                      {editingPostId ? 'Saving...' : 'Posting...'}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {editingPostId ? 'Save Changes' : 'Post'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-stone-800">Comments</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Existing comments */}
            {activePostId && (() => {
              const activePost = posts.find(p => (p as any)._id === activePostId || p.id === activePostId);
              const postComments = (activePost as any)?.comments || [];
              if (postComments.length === 0) return (
                <div className="px-4 py-6 text-center text-stone-400 text-sm">No comments yet. Be the first!</div>
              );
              return (
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {postComments.map((c: any) => (
                    <div key={c.id || c._id} className="text-xs">
                      <span className="font-bold mr-2 text-stone-800">{c.author?.name || 'Unknown'}</span>
                      <span className="text-stone-600">{c.content}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Input bar — always visible, same row as send button */}
            <div className="p-3 border-t border-stone-100 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim() && !commentingPostId) {
                    submitComment();
                  }
                }}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 bg-stone-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#3a5a40]"
                autoFocus
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim() || !!commentingPostId}
                className="w-10 h-10 bg-[#3a5a40] text-white rounded-full flex items-center justify-center hover:bg-[#588157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {commentingPostId ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Delete Post?</h3>
            <p className="text-sm text-stone-500 mb-6">This action cannot be undone. The post will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
