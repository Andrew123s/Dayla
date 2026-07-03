import React, { useEffect, useRef, useState } from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, MapPin, MoreVertical,
  Pencil, Trash2, Repeat2, UserPlus, Mountain, ChevronRight,
} from 'lucide-react';
import { MediaCarousel } from './MediaCarousel';
import { pid, timeAgo, formatCount } from './utils';

interface PostCardProps {
  post: any;
  currentUserId: string;
  onLike: (postId: string) => void;
  /** Double-tap on media: like only (never unlike). */
  onDoubleTapLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onShare: (post: any) => void;
  onSave: (postId: string) => void;
  onAddFriend: (authorId: string) => void;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  onRepost: (post: any) => void;
  /** Tap the author's avatar/name → open their profile. */
  onOpenProfile?: (author: any) => void;
  reposting: boolean;
}

/**
 * Redesigned Community post card.
 *
 * Hierarchy (top → bottom): identity → context (repost) → media → actions →
 * engagement → caption → conversation → time. Media is edge-to-edge and
 * dominant; metadata is quiet; actions are one consistent bar (44px targets).
 */
const PostCardInner: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onDoubleTapLike,
  onOpenComments,
  onShare,
  onSave,
  onAddFriend,
  onEdit,
  onDelete,
  onRepost,
  onOpenProfile,
  reposting,
}) => {
  const postId = pid(post);
  const author = post.author || {};
  const authorId = pid(author);
  const authorName = author.name || 'Unknown User';
  const authorAvatar = author.avatar || '';
  const locationName = post.location?.name || '';
  const images: { url: string }[] = post.images || [];
  const likeCount = post.likeCount ?? (Array.isArray(post.likes) ? post.likes.length : 0);
  const comments: any[] = post.comments || [];
  const isLiked = !!post.liked;
  const isSaved = !!post.saved;
  const isOwn = authorId === currentUserId;
  const edited = !!post.editedAt;
  const created = post.createdAt || post.publishedAt;
  const lastComment = comments.length > 0 ? comments[comments.length - 1] : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the overflow menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const longCaption = (post.content || '').length > 150;
  const caption = expanded || !longCaption ? post.content : `${(post.content || '').slice(0, 150).trimEnd()}…`;

  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
      {/* ── Identity row ─────────────────────────────────────────────── */}
      <div className="pl-4 pr-2 py-3 flex items-center gap-3">
        <button
          onClick={() => onOpenProfile?.(author)}
          aria-label={`View ${authorName}'s profile`}
          className="shrink-0 rounded-full active:scale-95 transition-transform"
        >
          {authorAvatar ? (
            <img src={authorAvatar} className="w-9 h-9 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#a3b18a] grid place-items-center">
              <span className="text-sm font-bold text-white">{authorName.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </button>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenProfile?.(author)}
              className="text-sm font-bold text-stone-800 truncate text-left"
            >
              {authorName}
            </button>
            <span className="text-[11px] text-stone-400 shrink-0">· {timeAgo(created)}{edited ? ' · edited' : ''}</span>
          </div>
          {locationName && (
            <div className="flex items-center gap-1 text-[#588157] mt-0.5">
              <MapPin size={11} className="shrink-0" />
              <span className="text-[11px] font-medium truncate">{locationName}</span>
            </div>
          )}
        </div>

        {!isOwn && (
          <button
            onClick={() => onAddFriend(authorId)}
            aria-label={`Add ${authorName} as a friend`}
            className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#3a5a40] bg-[#3a5a40]/10 hover:bg-[#3a5a40] hover:text-white px-2.5 py-1.5 rounded-full transition-colors"
          >
            <UserPlus size={13} />
            Add
          </button>
        )}

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Post options"
            aria-expanded={menuOpen}
            className="p-2.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-stone-100 py-1 z-30 overflow-hidden" role="menu">
              {isOwn && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(post); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                    role="menuitem"
                  >
                    <Pencil size={15} className="text-stone-500" /> Edit Post
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(postId); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    role="menuitem"
                  >
                    <Trash2 size={15} /> Delete Post
                  </button>
                </>
              )}
              <button
                onClick={() => { setMenuOpen(false); onRepost(post); }}
                disabled={reposting}
                className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors disabled:opacity-50"
                role="menuitem"
              >
                <Repeat2 size={15} className="text-stone-500" /> Repost
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Repost attribution ───────────────────────────────────────── */}
      {post.repostedFrom?.authorName && (
        <div className="px-4 pb-2 -mt-1 flex items-center gap-1.5 text-[11px] text-stone-400">
          <Repeat2 size={12} />
          <span>Reposted from <span className="font-bold text-stone-600">{post.repostedFrom.authorName}</span></span>
        </div>
      )}

      {/* ── Media ────────────────────────────────────────────────────── */}
      <MediaCarousel
        images={images}
        alt={post.title || `Post by ${authorName}`}
        onDoubleTapLike={() => onDoubleTapLike(postId)}
        onOpen={() => onOpenComments(postId)}
      />

      {/* ── Tagged trail (denormalised Piko route snapshot) ──────────── */}
      {post.routeRef?.title && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-2.5">
          {post.routeRef.thumbnail ? (
            <img src={post.routeRef.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-emerald-100 grid place-items-center shrink-0">
              <Mountain size={19} className="text-emerald-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Trail</p>
            <p className="text-[13px] font-bold text-stone-800 truncate">{post.routeRef.title}</p>
            <p className="text-[11px] text-stone-500 truncate">
              {[post.routeRef.location, post.routeRef.distanceKm ? `${post.routeRef.distanceKm} km` : null, post.routeRef.difficulty]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <ChevronRight size={16} className="text-emerald-300 shrink-0" />
        </div>
      )}

      {/* ── Actions + engagement + caption + conversation ────────────── */}
      <div className="px-4 pt-2.5 pb-4">
        <div className="flex items-center -ml-2">
          <button
            onClick={() => onLike(postId)}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            aria-pressed={isLiked}
            className={`p-2 rounded-full transition-all active:scale-125 ${isLiked ? 'text-red-500' : 'text-stone-700 hover:text-red-500'}`}
          >
            <Heart size={23} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => onOpenComments(postId)}
            aria-label="View comments"
            className="p-2 rounded-full text-stone-700 hover:text-[#3a5a40] transition-colors active:scale-110"
          >
            <MessageCircle size={22} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => onShare(post)}
            aria-label="Share post"
            className="p-2 rounded-full text-stone-700 hover:text-[#3a5a40] transition-colors active:scale-110"
          >
            <Share2 size={22} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => onSave(postId)}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            aria-pressed={isSaved}
            className={`p-2 rounded-full ml-auto transition-all active:scale-110 ${isSaved ? 'text-[#3a5a40]' : 'text-stone-700 hover:text-[#3a5a40]'}`}
          >
            <Bookmark size={22} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
        </div>

        {likeCount > 0 && (
          <p className="text-[13px] font-bold text-stone-800 mt-1">
            {formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {(post.title || post.content) && (
          <p className="text-sm text-stone-700 leading-relaxed mt-1">
            <span className="font-bold text-stone-800">{authorName}</span>{' '}
            {post.title && <span className="font-semibold">{post.title} · </span>}
            {caption}
            {longCaption && !expanded && (
              <button onClick={() => setExpanded(true)} className="text-stone-400 font-medium ml-1">
                more
              </button>
            )}
          </p>
        )}

        {comments.length > 0 && (
          <button onClick={() => onOpenComments(postId)} className="block text-left mt-1.5 w-full">
            {comments.length > 1 && (
              <span className="text-[13px] text-stone-400">View all {formatCount(comments.length)} comments</span>
            )}
            {lastComment && (
              <p className="text-[13px] text-stone-600 truncate mt-0.5">
                <span className="font-bold text-stone-700">{lastComment.author?.name || 'Someone'}</span>{' '}
                {lastComment.content}
              </p>
            )}
          </button>
        )}
      </div>
    </article>
  );
};

/** Memoised: the feed re-renders on every optimistic update; unchanged cards skip work. */
export const PostCard = React.memo(PostCardInner, (a, b) => a.post === b.post && a.reposting === b.reposting);
