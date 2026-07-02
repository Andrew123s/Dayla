import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Loader2 } from 'lucide-react';
import { RouteComment } from '../types';

interface RouteCommunityProps {
  voteScore: number;
  userVote: -1 | 0 | 1;
  onVote: (value: -1 | 0 | 1) => void;
  comments: RouteComment[];
  commentsLoading: boolean;
  onAddComment: (content: string) => void;
  addingComment: boolean;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** Votes + comments for a route (Phase 3 group collaboration). */
export function RouteCommunity({
  voteScore,
  userVote,
  onVote,
  comments,
  commentsLoading,
  onAddComment,
  addingComment,
}: RouteCommunityProps) {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text || addingComment) return;
    onAddComment(text);
    setDraft('');
  };

  // Toggling: clicking your current vote clears it.
  const cast = (v: -1 | 1) => onVote(userVote === v ? 0 : v);

  return (
    <section className="pt-7">
      <h2 className="text-lg font-bold text-slate-900 mb-3">Community</h2>

      {/* Votes */}
      <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <button
          type="button"
          onClick={() => cast(1)}
          aria-pressed={userVote === 1}
          aria-label="Upvote"
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
            userVote === 1 ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 ring-1 ring-gray-100'
          }`}
        >
          <ThumbsUp size={16} className={userVote === 1 ? 'fill-white' : ''} />
          Recommend
        </button>
        <button
          type="button"
          onClick={() => cast(-1)}
          aria-pressed={userVote === -1}
          aria-label="Downvote"
          className={`grid place-items-center w-10 h-10 rounded-full transition-colors ${
            userVote === -1 ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 ring-1 ring-gray-100'
          }`}
        >
          <ThumbsDown size={16} className={userVote === -1 ? 'fill-white' : ''} />
        </button>
        <div className="ml-auto text-right">
          <div className={`text-lg font-black leading-none ${voteScore > 0 ? 'text-emerald-600' : voteScore < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {voteScore > 0 ? `+${voteScore}` : voteScore}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">score</div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={17} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">
            {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
          </h3>
        </div>

        {commentsLoading ? (
          <div className="grid place-items-center py-6 text-emerald-500">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400 pb-1">Be the first to share tips about this route.</p>
        ) : (
          <ul className="flex flex-col gap-3.5">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                  {initials(c.author)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-800">{c.author}</span>
                    <span className="text-[11px] text-slate-400">{relativeTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-snug break-words">{c.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Composer */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="Add a comment…"
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || addingComment}
            aria-label="Send comment"
            className="grid place-items-center w-10 h-10 rounded-full bg-emerald-500 text-white disabled:opacity-40 active:scale-90 transition-transform shrink-0"
          >
            {addingComment ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
      </div>
    </section>
  );
}
