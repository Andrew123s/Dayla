import React from 'react';

/**
 * Loading skeleton mirroring the PostCard layout, so the feed doesn't jump when
 * real content replaces it. Uses Tailwind's pulse — no extra CSS.
 */
export const PostSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 animate-pulse" aria-hidden="true">
    <div className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-stone-200" />
      <div className="flex-1">
        <div className="h-3 w-28 bg-stone-200 rounded-full mb-2" />
        <div className="h-2.5 w-20 bg-stone-100 rounded-full" />
      </div>
    </div>
    <div className="aspect-[4/5] max-h-[420px] bg-stone-100" />
    <div className="p-4 space-y-2.5">
      <div className="flex gap-4">
        <div className="w-6 h-6 rounded-full bg-stone-200" />
        <div className="w-6 h-6 rounded-full bg-stone-200" />
        <div className="w-6 h-6 rounded-full bg-stone-200" />
        <div className="w-6 h-6 rounded-full bg-stone-200 ml-auto" />
      </div>
      <div className="h-3 w-24 bg-stone-200 rounded-full" />
      <div className="h-3 w-3/4 bg-stone-100 rounded-full" />
    </div>
  </div>
);
