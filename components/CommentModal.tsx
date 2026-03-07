
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader, MessageCircle, Trash2 } from 'lucide-react';
import { User } from '../types';
import { API_BASE_URL, authFetch } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommentAuthor {
  _id?: string;
  id?: string;
  name?: string;
  avatar?: string;
}

interface Comment {
  id?: string;
  _id?: string;
  author?: CommentAuthor;
  content: string;
  createdAt?: string;
}

interface CommentModalProps {
  user: User;
  post: any;
  onClose: () => void;
  /** Called whenever comments change so parent post counts stay accurate */
  onPostUpdate: (postId: string, comments: Comment[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function commentId(c: Comment): string {
  return (c.id || c._id) as string;
}

// ─── CommentItem ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  isOwn: boolean;
  isDeleting: boolean;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment, isOwn, isDeleting, onLongPressStart, onLongPressEnd,
}) => (
  <div
    className={`flex items-start gap-3 py-2 select-none transition-opacity duration-200 ${
      isDeleting ? 'opacity-30' : 'opacity-100'
    }`}
    onTouchStart={onLongPressStart}
    onTouchEnd={onLongPressEnd}
    onTouchCancel={onLongPressEnd}
    onMouseDown={onLongPressStart}
    onMouseUp={onLongPressEnd}
    onMouseLeave={onLongPressEnd}
  >
    {/* Avatar */}
    {comment.author?.avatar ? (
      <img
        src={comment.author.avatar}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
        alt=""
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
        {(comment.author?.name || '?')[0]?.toUpperCase()}
      </div>
    )}

    {/* Body */}
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-[13px] font-semibold text-stone-800 leading-none">
          {comment.author?.name || 'Unknown'}
        </span>
        {comment.createdAt && (
          <span className="text-[11px] text-stone-400">{timeAgo(comment.createdAt)}</span>
        )}
        {isOwn && (
          <span className="text-[10px] text-stone-300">· hold to delete</span>
        )}
      </div>
      <p className="text-sm text-stone-700 mt-0.5 break-words leading-snug">
        {comment.content}
      </p>
    </div>
  </div>
);

// ─── ActionSheet ──────────────────────────────────────────────────────────────

interface ActionSheetProps {
  onDelete: () => void;
  onCancel: () => void;
}

const ActionSheet: React.FC<ActionSheetProps> = ({ onDelete, onCancel }) => (
  <>
    {/* Dimmed backdrop */}
    <div
      className="fixed inset-0 z-[70] bg-black/40"
      onClick={onCancel}
    />
    {/* Sheet */}
    <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-2xl overflow-hidden action-sheet-enter">
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 bg-stone-200 rounded-full" />
      </div>
      <p className="text-[11px] text-stone-400 text-center uppercase tracking-widest font-semibold pb-3">
        Comment
      </p>
      <div className="border-t border-stone-100">
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors text-sm font-semibold"
        >
          <Trash2 size={18} />
          Delete Comment
        </button>
        <button
          onClick={onCancel}
          className="w-full px-6 py-4 text-stone-600 hover:bg-stone-50 active:bg-stone-100 transition-colors text-sm font-medium border-t border-stone-100"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          Cancel
        </button>
      </div>
    </div>
  </>
);

// ─── CommentInputBar ──────────────────────────────────────────────────────────

interface CommentInputBarProps {
  user: User;
  value: string;
  posting: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

const CommentInputBar: React.FC<CommentInputBarProps> = ({
  user, value, posting, onChange, onSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus after mount (slight delay so the sheet animation finishes first)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-t border-stone-100 bg-white flex-shrink-0"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {/* User avatar */}
      {user.avatar ? (
        <img
          src={user.avatar}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          alt=""
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Add a comment…"
        className="flex-1 bg-stone-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3a5a40]/30 transition-shadow placeholder:text-stone-400"
      />

      {/* Send button */}
      <button
        onClick={onSubmit}
        disabled={!value.trim() || posting}
        className="w-9 h-9 flex items-center justify-center rounded-full transition-all disabled:opacity-30 active:scale-90"
      >
        {posting ? (
          <Loader size={18} className="animate-spin text-[#3a5a40]" />
        ) : (
          <Send
            size={18}
            strokeWidth={2.5}
            className={value.trim() ? 'text-[#3a5a40]' : 'text-stone-400'}
          />
        )}
      </button>
    </div>
  );
};

// ─── CommentModal (main) ──────────────────────────────────────────────────────

const CommentModal: React.FC<CommentModalProps> = ({ user, post, onClose, onPostUpdate }) => {
  const postId: string = (post as any)._id || post.id;

  const [comments, setComments] = useState<Comment[]>((post as any).comments || []);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSheetId, setActionSheetId] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // ── Notify parent whenever comment list changes ──────────────────────────
  useEffect(() => {
    onPostUpdate(postId, comments);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  // ── Lock body scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── iOS Safari keyboard: keep sheet above keyboard via visualViewport ────
  useEffect(() => {
    const vv = (window as any).visualViewport as (VisualViewport | undefined);
    if (!vv || !sheetRef.current) return;

    const update = () => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      // Distance from bottom of layout viewport to bottom of visual viewport
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheet.style.bottom = `${offset}px`;
      sheet.style.height = `${vv.height}px`;
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [comments.length, scrollToBottom]);

  // ── Post comment ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    setText('');

    const tempId = `temp_${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      _id: tempId,
      author: { _id: user.id, name: user.name, avatar: user.avatar },
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, optimistic]);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (data.success && data.data?.comment) {
        setComments(prev =>
          prev.map(c => (c.id === tempId || c._id === tempId) ? data.data.comment : c)
        );
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId && c._id !== tempId));
      }
    } catch {
      setComments(prev => prev.filter(c => c.id !== tempId && c._id !== tempId));
    } finally {
      setPosting(false);
    }
  };

  // ── Delete comment ────────────────────────────────────────────────────────
  const handleDelete = async (cid: string) => {
    setActionSheetId(null);
    setDeletingId(cid);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/community/posts/${postId}/comments/${cid}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.filter(c => commentId(c) !== cid));
      }
    } catch {
      // ignore — keep comment in list
    } finally {
      setDeletingId(null);
    }
  };

  // ── Long-press ────────────────────────────────────────────────────────────
  const handleLongPressStart = (cid: string, rawAuthorId: any) => {
    const aid = typeof rawAuthorId === 'object' ? rawAuthorId?.toString() : rawAuthorId;
    if (aid !== user.id) return;
    const t = setTimeout(() => setActionSheetId(cid), 500);
    setLongPressTimer(t);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) { clearTimeout(longPressTimer); setLongPressTimer(null); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet
          Mobile  : fixed to bottom, full visual viewport height
          Desktop : centered, auto height, max-w-lg
      */}
      <div
        ref={sheetRef}
        className="comment-sheet fixed z-50 inset-x-0 bottom-0 flex flex-col bg-white rounded-t-2xl md:inset-0 md:m-auto md:rounded-2xl md:max-w-lg md:h-fit md:max-h-[85vh]"
        style={{ height: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 flex-shrink-0">
          <h3 className="text-base font-bold text-stone-800">
            Comments ({comments.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-full hover:bg-stone-100 active:bg-stone-200 transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {/* Comment list — scrolls independently */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto overscroll-contain min-h-0"
        >
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-2">
              <MessageCircle size={40} className="text-stone-200" />
              <p className="text-stone-500 text-sm font-medium">No comments yet</p>
              <p className="text-stone-400 text-xs">Be the first to comment!</p>
            </div>
          ) : (
            <div className="px-4 divide-y divide-stone-50">
              {comments.map((c) => {
                const cid = commentId(c);
                const authorId = c.author?._id || c.author?.id || (c.author as any);
                const isOwn =
                  authorId === user.id ||
                  (typeof authorId === 'object' && (authorId as any)?.toString() === user.id);
                return (
                  <CommentItem
                    key={cid}
                    comment={c}
                    isOwn={isOwn}
                    isDeleting={deletingId === cid}
                    onLongPressStart={() => handleLongPressStart(cid, authorId)}
                    onLongPressEnd={handleLongPressEnd}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Input bar — stays above keyboard */}
        <CommentInputBar
          user={user}
          value={text}
          posting={posting}
          onChange={setText}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Long-press action sheet */}
      {actionSheetId && (
        <ActionSheet
          onDelete={() => handleDelete(actionSheetId)}
          onCancel={() => setActionSheetId(null)}
        />
      )}

      {/* Animations */}
      <style>{`
        .comment-sheet {
          animation: sheet-slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) both;
        }
        .action-sheet-enter {
          animation: sheet-slide-up 0.22s cubic-bezier(0.32, 0.72, 0, 1) both;
        }
        @keyframes sheet-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .comment-sheet {
            animation: modal-scale-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          @keyframes modal-scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }
        }
      `}</style>
    </>
  );
};

export default CommentModal;
