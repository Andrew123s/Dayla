
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Post } from '../types';
import { Plus, Image as ImageIcon, X, Send, Loader, Trash2 } from 'lucide-react';
import { initializeSocket, getSocket } from '../lib/socket';
import { API_BASE_URL, authFetch } from '../lib/api';
import CommentModal from './CommentModal';
import { PostCard } from './community/PostCard';
import { PostSkeleton } from './community/PostSkeleton';

const PAGE_SIZE = 10;

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
  const [newPost, setNewPost] = useState({
    content: '',
    location: '',
    title: '',
    image: null as File | null,
    imagePreview: null as string | null
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Infinite scroll
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
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
        socket.off('comment:deleted');
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
      if (!data.comment) return;
      const cid = data.comment.id || data.comment._id;
      setPosts(prev => prev.map(post => {
        if ((post._id || post.id) !== data.postId) return post;
        const existing = ((post as any).comments || []).some((c: any) => (c.id || c._id) === cid);
        if (existing) return post;
        return { ...post, comments: [...((post as any).comments || []), data.comment] } as any;
      }));
    });

    socket.on('comment:deleted', (data: any) => {
      console.log('Comment deleted:', data);
      setPosts(prev => prev.map(post => {
        if ((post._id || post.id) !== data.postId) return post;
        const comments = ((post as any).comments || []).filter((c: any) => (c.id || c._id) !== data.commentId);
        return { ...post, comments } as any;
      }));
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
      socket.off('comment:deleted');
      socket.off('trip:saved');
      socket.off('friend:request_sent');
    };
  }, []);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Paginated fetch. page 1 replaces the feed; later pages append (dedup by id).
  const fetchPosts = useCallback(async (page = 1) => {
    if (page === 1) setError('');
    else setLoadingMore(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts?page=${page}&limit=${PAGE_SIZE}`);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response');
      }

      const data = await response.json();

      if (data.success) {
        const list: any[] = Array.isArray(data.data?.posts) ? data.data.posts : [];
        setHasMore(list.length === PAGE_SIZE);
        pageRef.current = page;
        if (page === 1) {
          setPosts(list);
        } else {
          setPosts(prev => {
            const seen = new Set(prev.map(p => (p as any)._id || p.id));
            return [...prev, ...list.filter(p => !seen.has((p as any)._id || p.id))];
          });
        }
      } else {
        throw new Error(data.message || 'Failed to load posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (page === 1) setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchPosts(pageRef.current + 1);
        }
      },
      { rootMargin: '600px' } // prefetch well before the user reaches the end
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchPosts]);

  // Optimistic like: flip instantly, reconcile with the server, roll back on failure.
  const handleLike = async (postId: string) => {
    const target = posts.find(p => ((p as any)._id || p.id) === postId) as any;
    if (!target) return;
    const wasLiked = !!target.liked;
    const prevCount = target.likeCount ?? (Array.isArray(target.likes) ? target.likes.length : 0);
    const patch = (liked: boolean, likeCount: number) =>
      setPosts(prev => prev.map(post =>
        ((post as any)._id || post.id) === postId ? { ...post, liked, likeCount } as any : post
      ));

    patch(!wasLiked, Math.max(0, prevCount + (wasLiked ? -1 : 1)));
    if (!wasLiked && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10);

    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts/${postId}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.success) {
        patch(data.data.liked, data.data.likeCount); // reconcile with the truth
      } else {
        patch(wasLiked, prevCount); // roll back
      }
    } catch (error) {
      console.error('Error liking post:', error);
      patch(wasLiked, prevCount);
    }
  };

  // Double-tap on media likes but never unlikes (Instagram behaviour).
  const handleDoubleTapLike = (postId: string) => {
    const target = posts.find(p => ((p as any)._id || p.id) === postId) as any;
    if (target && !target.liked) handleLike(postId);
  };

  // Share via the native sheet, falling back to the clipboard.
  const handleShare = async (post: any) => {
    const authorName = post.author?.name || 'a Dayla explorer';
    const shareData = {
      title: post.title || `Adventure by ${authorName}`,
      text: `${post.content || ''}`.slice(0, 140),
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} — ${shareData.text} ${shareData.url}`);
        setSuccessMessage('Copied to clipboard');
        setTimeout(() => setSuccessMessage(''), 2500);
      }
    } catch {
      /* user cancelled the share sheet */
    }
  };

  const handleComment = (postId: string) => {
    setActivePostId(postId);
    setShowCommentModal(true);
  };

  const handleCommentModalPostUpdate = (postId: string, comments: any[]) => {
    setPosts(prev => prev.map(p => {
      const pid = (p as any)._id || p.id;
      if (pid !== postId) return p;
      return { ...p, comments } as any;
    }));
  };

  // Optimistic save: the bookmark filling in IS the feedback; roll back on failure.
  const handleSaveTrip = async (postId: string) => {
    const target = posts.find(p => ((p as any)._id || p.id) === postId) as any;
    if (!target) return;
    const wasSaved = !!target.saved;
    const patch = (saved: boolean) =>
      setPosts(prev => prev.map(post =>
        ((post as any)._id || post.id) === postId ? { ...post, saved } as any : post
      ));

    patch(!wasSaved);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/community/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) patch(!!data.data.saved);
      else patch(wasSaved);
    } catch (error) {
      console.error('Error saving trip:', error);
      patch(wasSaved);
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

  const handleDeletePost = (postId: string) => {
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

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
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
          <>
            {posts.map((post) => (
              <PostCard
                key={(post as any)._id || post.id}
                post={post}
                currentUserId={user.id}
                onLike={handleLike}
                onDoubleTapLike={handleDoubleTapLike}
                onOpenComments={handleComment}
                onShare={handleShare}
                onSave={handleSaveTrip}
                onAddFriend={handleSendFriendRequest}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onRepost={handleRepost}
                reposting={posting}
              />
            ))}

            {/* Infinite-scroll sentinel + tail states */}
            <div ref={sentinelRef} aria-hidden="true" />
            {loadingMore && (
              <div className="flex justify-center py-4" role="status" aria-label="Loading more posts">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-[#3a5a40] rounded-full animate-spin" />
              </div>
            )}
            {!hasMore && posts.length > 3 && (
              <p className="text-center text-xs text-stone-400 py-4">You're all caught up ✨</p>
            )}
          </>
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
      {showCommentModal && activePostId && (() => {
        const activePost = posts.find(p => (p as any)._id === activePostId || p.id === activePostId);
        if (!activePost) return null;
        return (
          <CommentModal
            key={activePostId}
            user={user}
            post={activePost}
            onClose={() => { setShowCommentModal(false); setActivePostId(null); }}
            onPostUpdate={handleCommentModalPostUpdate}
          />
        );
      })()}

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
