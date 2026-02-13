"use client";

import { useAppStore } from "@/lib/store";

export function UploadQueue() {
  const { uploads } = useAppStore();

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-72 flex flex-col gap-2">
      {uploads.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 shadow-lg transition-all animate-in"
        >
          {/* Status indicator */}
          <div className="flex-shrink-0">
            {(task.status === "uploading" || task.status === "processing") && (
              <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            )}
            {task.status === "done" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {task.status === "error" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
              {task.name}
            </p>
            <p className="text-xs text-zinc-400">
              {task.status === "uploading" && "Uploading..."}
              {task.status === "processing" && "Processing..."}
              {task.status === "done" && "Added"}
              {task.status === "error" && "Failed"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
