import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, UserPlus, MapPin, Loader, Camera, Play, Mountain } from 'lucide-react';
import { User } from '../../types';
import { API_BASE_URL, authFetch } from '../../lib/api';
import CommentModal from '../CommentModal';
import { pid } from './utils';

interface ProfileAuthor {
  _id?: string;
  id?: string;
  name?: string;
  avatar?: string;
  bio?: string;
}

interface UserProfileViewProps {
  /** The author object from the feed (name/avatar/bio come populated). */
  author: ProfileAuthor;
  /** The signed-in viewer. */
  user: User;
  onClose: () => void;
  onAddFriend: (authorId: string) => void;
}

const PAGE_SIZE = 18;

/**
 * User profile overlay: identity header + a 3-column media grid of the user's
 * posts (existing GET /api/community/users/:userId/posts). Tapping a tile opens
 * that post's comment sheet locally, so the profile is fully self-contained.
 */
export const UserProfileView: React.FC<UserProfileViewProps> = ({ author, user, onClose, onAddFriend }) => {
  const authorId = pid(author);
  const authorName = author.name || 'Explorer';
  const isSelf = authorId === user.id;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [openPost, setOpenPost] = useState<any | null>(null);

  const fetchPage = useCallback(async (p: number) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/community/users/${authorId}/posts?page=${p}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load posts');
      const list: any[] = data.data?.posts || [];
      setHasMore(list.length === PAGE_SIZE);
      setPage(p);
      setPosts(prev => (p === 1 ? list : [...prev, ...list]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // Escape closes (comment sheet first, then the profile).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (openPost) setOpenPost(null);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPost, onClose]);

  return (
    <div className="absolute inset-0 z-50 bg-[#f7f3ee] flex flex-col" role="dialog" aria-modal="true" aria-label={`${authorName}'s profile`}>
      {/* Header bar */}
      <div className="flex items-center gap-2 px-2 py-2 bg-white border-b border-stone-100 shrink-0">
        <button
          onClick={onClose}
          aria-label="Back to feed"
          className="grid place-items-center w-10 h-10 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-stone-800 truncate">{authorName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="bg-white px-5 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-4">
            {author.avatar ? (
              <img src={author.avatar} className="w-20 h-20 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#a3b18a] grid place-items-center">
                <span className="text-2xl font-bold text-white">{authorName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black text-stone-800 truncate">{authorName}</h1>
              {author.bio && <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">{author.bio}</p>}
              <p className="text-xs font-semibold text-stone-400 mt-1.5">
                {loading ? '…' : `${posts.length}${hasMore ? '+' : ''} ${posts.length === 1 ? 'post' : 'posts'}`}
              </p>
            </div>
          </div>
          {!isSelf && (
            <button
              onClick={() => onAddFriend(authorId)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3a5a40] text-white text-sm font-bold hover:bg-[#588157] active:scale-[0.99] transition-all"
            >
              <UserPlus size={16} />
              Add Friend
            </button>
          )}
        </div>

        {/* Post grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-14 text-center px-8">
            <p className="text-sm font-semibold text-stone-600 mb-4">{error}</p>
            <button
              onClick={() => fetchPage(1)}
              className="text-sm font-bold text-[#3a5a40] bg-[#3a5a40]/10 px-5 py-2.5 rounded-full active:scale-95 transition-transform"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-white rounded-full grid place-items-center mx-auto mb-3 border border-stone-100">
              <Camera size={24} className="text-stone-300" />
            </div>
            <p className="text-stone-600 font-medium">No posts yet</p>
            <p className="text-stone-400 text-sm mt-1">
              {isSelf ? 'Share your first adventure!' : `${authorName} hasn't posted yet.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {posts.map((post) => {
                const postId = pid(post);
                const media = (post.images || [])[0];
                const isVideo = media?.type === 'video';
                return (
                  <button
                    key={postId}
                    onClick={() => setOpenPost(post)}
                    aria-label={`Open post: ${(post.content || '').slice(0, 40)}`}
                    className="relative aspect-square bg-stone-200 overflow-hidden active:opacity-80 transition-opacity"
                  >
                    {media ? (
                      isVideo ? (
                        <video src={media.url} preload="metadata" muted playsInline className="w-full h-full object-cover pointer-events-none" />
                      ) : (
                        <img src={media.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full bg-white p-2 flex flex-col justify-between text-left">
                        <p className="text-[11px] text-stone-600 leading-snug line-clamp-4">{post.content}</p>
                        {post.location?.name && (
                          <span className="flex items-center gap-0.5 text-[9px] font-semibold text-[#588157] truncate">
                            <MapPin size={9} className="shrink-0" /> {post.location.name}
                          </span>
                        )}
                      </div>
                    )}
                    {isVideo && (
                      <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
                        <Play size={14} className="fill-white" />
                      </span>
                    )}
                    {post.routeRef?.title && (
                      <span className="absolute bottom-1.5 left-1.5 bg-emerald-500/90 text-white rounded-full p-1" title={post.routeRef.title}>
                        <Mountain size={10} />
                      </span>
                    )}
                    {(post.images || []).length > 1 && (
                      <span className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 rounded-full">
                        {(post.images || []).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => fetchPage(page + 1)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 text-sm font-bold text-[#3a5a40] bg-white border border-stone-200 px-5 py-2.5 rounded-full active:scale-95 transition-transform disabled:opacity-50"
                >
                  {loadingMore && <Loader size={14} className="animate-spin" />}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Post viewer — reuse the comment sheet for the selected grid item */}
      {openPost && (
        <CommentModal
          key={pid(openPost)}
          user={user}
          post={openPost}
          onClose={() => setOpenPost(null)}
          onPostUpdate={(postId, comments) =>
            setPosts(prev => prev.map(p => (pid(p) === postId ? { ...p, comments } : p)))
          }
        />
      )}
    </div>
  );
};
