
import React, {
  useState, useRef, useEffect, useCallback, memo,
} from 'react';
import { Socket } from 'socket.io-client';
import { Clock } from 'lucide-react';
import { StickyNote, User } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── VoiceNote sub-component ─────────────────────────────────────────────────

const VoiceNotePlayer: React.FC<{ note: StickyNote }> = memo(({ note }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(note.audioUrl || note.content);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setProgress((audio.currentTime / audio.duration) * 100));
    audio.addEventListener('ended', () => { setPlaying(false); setProgress(0); });
    return () => { audio.pause(); audio.src = ''; };
  }, [note.audioUrl, note.content]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = audioRef.current!;
    if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); }
  };

  return (
    <div className="flex flex-col gap-2 p-2 h-full justify-center" onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-full bg-[#3a5a40] text-white flex items-center justify-center shadow-md flex-shrink-0 active:scale-95 transition-transform"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-white/40 rounded-full overflow-hidden">
            <div className="h-full bg-[#3a5a40]/70 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[9px] text-stone-500 font-bold mt-0.5">
            {duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface StickyNoteCardProps {
  note: StickyNote;
  user: User;
  collaboratorEditingUser: User | null;
  dashboardId: string;
  tripId: string;
  socketRef: React.RefObject<Socket | null>;
  croppingId: string | null;
  /** Canvas zoom level ref — used to convert screen deltas to world deltas */
  zoomRef: React.RefObject<number>;
  onContentChange: (id: string, content: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onLinkToggle: (id: string) => void;
  onEditStart: (id: string) => void;
  onEditEnd: (id: string) => void;
  onCropToggle: (id: string) => void;
  onZoom: (id: string, delta: number) => void;
}

// ─── StickyNoteCard ───────────────────────────────────────────────────────────

const MIN_W = 160;
const MIN_H = 100;
const LONG_PRESS_MS = 350;

const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note, user, collaboratorEditingUser,
  dashboardId, tripId, socketRef,
  croppingId, zoomRef,
  onContentChange, onPositionChange, onSizeChange,
  onDelete, onLinkToggle, onEditStart, onEditEnd,
  onCropToggle, onZoom,
}) => {
  // ── Interaction state ──────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafHandle = useRef<number | null>(null);

  // Stable copies of position/size for drag math (no stale closures)
  const dragOrigin = useRef({ clientX: 0, clientY: 0, noteX: 0, noteY: 0 });
  const resizeOrigin = useRef({ clientX: 0, clientY: 0, noteW: 0, noteH: 0 });
  const activePointerId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // ── Auto-grow textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [note.content, isEditing]);

  // ── Sync DOM position when parent updates (e.g., socket event) ────────────
  useEffect(() => {
    if (isDraggingRef.current || isResizingRef.current) return;
    const el = cardRef.current;
    if (!el) return;
    el.style.left = `${note.x}px`;
    el.style.top = `${note.y}px`;
    el.style.width = `${note.width}px`;
    el.style.height = note.type === 'text' ? 'auto' : `${note.height}px`;
  }, [note.x, note.y, note.width, note.height, note.type]);

  // ── Pointer down on card ───────────────────────────────────────────────────
  const handleCardPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Never start drag from inside interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('textarea') ||
      target.closest('button') ||
      target.closest('.note-toolbar') ||
      target.closest('.resize-handle')
    ) return;

    e.stopPropagation();
    activePointerId.current = e.pointerId;
    cardRef.current?.setPointerCapture(e.pointerId);

    const isTouch = e.pointerType === 'touch';

    dragOrigin.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      noteX: note.x,
      noteY: note.y,
    };

    if (isTouch) {
      // Mobile: wait for long press before enabling drag
      longPressTimer.current = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(30);
        isDraggingRef.current = true;
        setIsDragging(true);
      }, LONG_PRESS_MS);
    } else {
      // Desktop: immediate drag
      isDraggingRef.current = true;
      setIsDragging(true);
    }
  }, [note.x, note.y]);

  const handleCardPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activePointerId.current) return;

    if (isDraggingRef.current) {
      e.stopPropagation();
      // Divide screen delta by canvas zoom to get world-coordinate delta
      const scale = zoomRef.current ?? 1;
      const dx = (e.clientX - dragOrigin.current.clientX) / scale;
      const dy = (e.clientY - dragOrigin.current.clientY) / scale;
      const newX = dragOrigin.current.noteX + dx;
      const newY = dragOrigin.current.noteY + dy;

      if (rafHandle.current) cancelAnimationFrame(rafHandle.current);
      rafHandle.current = requestAnimationFrame(() => {
        const el = cardRef.current;
        if (!el) return;
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      });
    }
  }, [zoomRef]);

  const handleCardPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activePointerId.current) return;

    // Cancel long-press timer if it hasn't fired yet
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);

      // Read final DOM position (world coords) and report to parent
      const el = cardRef.current;
      if (el) {
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        onPositionChange(note.id, Math.round(x), Math.round(y));
      }
    }

    activePointerId.current = null;
  }, [note.id, onPositionChange]);

  // ── Resize handle ──────────────────────────────────────────────────────────
  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const el = cardRef.current;
    if (!el) return;

    isResizingRef.current = true;
    setIsResizing(true);
    resizeOrigin.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      noteW: el.offsetWidth,
      noteH: el.offsetHeight,
    };
  }, []);

  const handleResizePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    e.stopPropagation();
    // Divide screen delta by canvas zoom to get world-coordinate delta
    const scale = zoomRef.current ?? 1;
    const dw = (e.clientX - resizeOrigin.current.clientX) / scale;
    const dh = (e.clientY - resizeOrigin.current.clientY) / scale;
    const newW = Math.max(MIN_W, resizeOrigin.current.noteW + dw);
    const newH = Math.max(MIN_H, resizeOrigin.current.noteH + dh);

    if (rafHandle.current) cancelAnimationFrame(rafHandle.current);
    rafHandle.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      el.style.width = `${newW}px`;
      if (note.type !== 'text') el.style.height = `${newH}px`;
    });
  }, [note.type, zoomRef]);

  const handleResizePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    setIsResizing(false);

    const el = cardRef.current;
    if (el) {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      onSizeChange(note.id, w, h);
    }
  }, [note.id, onSizeChange]);

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const enterEditMode = useCallback(() => {
    setIsEditing(true);
    onEditStart(note.id);
    setTimeout(() => {
      textareaRef.current?.focus();
      const len = textareaRef.current?.value.length ?? 0;
      textareaRef.current?.setSelectionRange(len, len);
    }, 0);
  }, [note.id, onEditStart]);

  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    onEditEnd(note.id);
  }, [note.id, onEditEnd]);

  // Tap on text note → enter edit mode (only if not dragging)
  const handleNoteTap = useCallback((e: React.MouseEvent) => {
    if (note.type !== 'text' && note.type !== 'schedule') return;
    if (isDraggingRef.current) return;
    e.stopPropagation();
    if (!isEditing) enterEditMode();
  }, [note.type, isEditing, enterEditMode]);

  // ── Computed styles ────────────────────────────────────────────────────────
  const isTextNote = note.type === 'text' || note.type === 'schedule';
  const isImageNote = note.type === 'image';
  const isVoiceNote = note.type === 'voice';

  const cardStyle: React.CSSProperties = {
    left: note.x,
    top: note.y,
    width: note.width,
    height: isTextNote ? 'auto' : note.height,
    backgroundColor: (isImageNote || isVoiceNote) ? 'transparent' : note.color,
    zIndex: isDragging ? 30 : isEditing ? 25 : 20,
    cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'grab',
    transform: isDragging ? 'scale(1.03) rotate(1deg)' : 'scale(1) rotate(0deg)',
    willChange: isDragging ? 'transform' : 'auto',
  };

  return (
    <div
      ref={cardRef}
      className={`
        absolute rounded-2xl flex flex-col select-none group
        transition-shadow transition-transform duration-150
        ${isTextNote ? 'p-3' : ''}
        ${isDragging ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'}
        ${isEditing ? 'ring-2 ring-[#3a5a40]/40' : ''}
      `}
      style={cardStyle}
      onPointerDown={handleCardPointerDown}
      onPointerMove={handleCardPointerMove}
      onPointerUp={handleCardPointerUp}
      onPointerCancel={handleCardPointerUp}
      onClick={handleNoteTap}
    >
      {/* ── Collaborator editing badge ─────────────────────────────────── */}
      {collaboratorEditingUser && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3a5a40] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg z-30 flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
          {collaboratorEditingUser.name} is editing
        </div>
      )}

      {/* ── Toolbar (hover / edit mode) ────────────────────────────────── */}
      <div
        className={`note-toolbar absolute -top-9 left-0 right-0 flex justify-between px-2 py-1
          bg-white/90 backdrop-blur-sm rounded-xl border border-stone-100 shadow-sm
          transition-opacity duration-150 pointer-events-auto
          ${isEditing || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1">
          <button
            onClick={() => onLinkToggle(note.id)}
            className="p-1 hover:bg-[#3a5a40]/10 rounded text-[#3a5a40] transition-colors"
            title="Link note"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          {isImageNote && (
            <button
              onClick={() => onCropToggle(note.id)}
              className={`p-1 hover:bg-[#3a5a40]/10 rounded transition-colors ${croppingId === note.id ? 'bg-[#3a5a40] text-white' : 'text-[#3a5a40]'}`}
              title="Crop/zoom"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 2 6 6 2 6"/><polyline points="18 2 18 6 22 6"/><polyline points="6 22 6 18 2 18"/><polyline points="18 22 18 18 22 18"/></svg>
            </button>
          )}
        </div>
        <button
          onClick={() => onDelete(note.id)}
          className="p-1 hover:bg-red-50 text-red-400 hover:text-red-500 rounded transition-colors"
          title="Delete note"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>

      {/* ── Note body ──────────────────────────────────────────────────── */}
      {isImageNote ? (
        <div className="w-full h-full relative overflow-hidden rounded-2xl bg-stone-200 border-4 border-white shadow-sm">
          <img
            src={note.content}
            className="w-full h-full object-cover"
            style={{ transform: `scale(${note.crop?.zoom || 1})`, transformOrigin: 'center' }}
            alt=""
            draggable={false}
          />
          {croppingId === note.id && (
            <div
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2">
                <button onClick={() => onZoom(note.id, -0.1)} className="px-4 py-2 bg-white rounded-lg text-[#3a5a40] shadow-md font-bold text-lg">−</button>
                <button onClick={() => onZoom(note.id, +0.1)} className="px-4 py-2 bg-white rounded-lg text-[#3a5a40] shadow-md font-bold text-lg">+</button>
              </div>
              <button onClick={() => onCropToggle(note.id)} className="text-[11px] text-white font-bold uppercase underline">Done</button>
            </div>
          )}
          {note.createdBy && (
            <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 z-10 pointer-events-none">
              {note.createdBy.avatar ? (
                <img src={note.createdBy.avatar} className="w-3 h-3 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center text-[5px] font-bold text-white">
                  {note.createdBy.name[0].toUpperCase()}
                </div>
              )}
              <span className="text-[7px] font-bold text-white/80 truncate max-w-[80px]">
                {note.createdBy.id === user.id ? 'You' : note.createdBy.name}
              </span>
            </div>
          )}
        </div>
      ) : isVoiceNote ? (
        <VoiceNotePlayer note={note} />
      ) : (
        /* ── Text note body ─────────────────────────────────────────── */
        <>
          {/* Emoji + date */}
          <div className="flex justify-between items-start mb-1 flex-shrink-0">
            <span className="text-lg leading-none">{note.emoji}</span>
            {note.scheduledDate && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-stone-600 uppercase tracking-wide">
                <Clock size={9} />
                {formatDate(note.scheduledDate)}
              </div>
            )}
          </div>

          {/* Full-surface textarea */}
          <textarea
            ref={textareaRef}
            value={note.content}
            onChange={(e) => {
              onContentChange(note.id, e.target.value);
            }}
            onFocus={() => {
              if (!isEditing) enterEditMode();
            }}
            onBlur={exitEditMode}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type here…"
            className="w-full bg-transparent border-none resize-none focus:ring-0 outline-none
              text-sm font-medium text-stone-800 leading-snug placeholder:text-stone-400
              overflow-hidden min-h-[2rem]"
            style={{ height: 'auto' }}
            rows={1}
          />

          {/* Author footer */}
          {(note.createdBy || note.lastEditedBy) && (
            <div className="mt-2 pt-1.5 border-t border-stone-200/50 flex flex-col gap-0.5 flex-shrink-0">
              {note.createdBy && (
                <div className="flex items-center gap-1.5">
                  {note.createdBy.avatar ? (
                    <img src={note.createdBy.avatar} className="w-3 h-3 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-[#3a5a40] flex items-center justify-center text-[5px] font-bold text-white">
                      {note.createdBy.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-[8px] font-semibold text-stone-400 truncate">
                    Added by {note.createdBy.id === user.id ? 'You' : note.createdBy.name} · {timeAgo(note.createdBy.timestamp)}
                  </span>
                </div>
              )}
              {note.lastEditedBy && (
                <div className="flex items-center gap-1.5">
                  {note.lastEditedBy.avatar ? (
                    <img src={note.lastEditedBy.avatar} className="w-3 h-3 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-[#588157] flex items-center justify-center text-[5px] font-bold text-white">
                      {note.lastEditedBy.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-[8px] font-semibold text-stone-400 truncate">
                    Edited by {note.lastEditedBy.id === user.id ? 'You' : note.lastEditedBy.name} · {timeAgo(note.lastEditedBy.timestamp)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Resize handle ─────────────────────────────────────────────── */}
      <div
        className={`
          resize-handle absolute -bottom-1 -right-1 w-5 h-5 rounded-full
          bg-[#3a5a40] border-2 border-white shadow-md
          flex items-center justify-center text-white
          cursor-nwse-resize z-40
          transition-opacity duration-150
          ${isEditing || isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
        `}
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
          <path d="M9 5.5L5.5 9M9 2L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Drag ring overlay */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-[#3a5a40]/30 pointer-events-none" />
      )}
    </div>
  );
};

export default memo(StickyNoteCard);
