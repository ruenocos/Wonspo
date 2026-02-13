"use client";

import { useCallback } from "react";
import { useTheme } from "./ThemeProvider";
import { useAppStore, LayoutMode } from "@/lib/store";
import { computeTidyLayout } from "@/lib/placement";

const MODES: { key: LayoutMode; label: string }[] = [
  { key: "auto", label: "Auto" },
  { key: "tidy", label: "Tidy" },
  { key: "freeform", label: "Free" },
];

export function Toolbar() {
  const { theme, toggleTheme } = useTheme();
  const { zoom, setZoom, layoutMode, setLayoutMode, items, updateItem, panX, panY } =
    useAppStore();

  const handleModeChange = useCallback(
    async (mode: LayoutMode) => {
      setLayoutMode(mode);

      if (mode === "tidy" && items.length > 0) {
        const cx = (window.innerWidth / 2 - panX) / zoom;
        const cy = (window.innerHeight / 2 - panY) / zoom;

        const layout = computeTidyLayout(
          items.map((i) => ({ id: i.id, width: i.width, height: i.height })),
          cx,
          cy
        );

        for (const pos of layout) {
          updateItem(pos.id, { posX: pos.posX, posY: pos.posY });
        }

        await Promise.all(
          layout.map((pos) =>
            fetch(`/api/items/${pos.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ posX: pos.posX, posY: pos.posY }),
            })
          )
        );
      }
    },
    [setLayoutMode, items, updateItem, panX, panY, zoom]
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 shadow-xl">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600" />

      {/* Zoom controls */}
      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-lg"
        title="Zoom out"
      >
        -
      </button>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-12 text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-lg"
        title="Zoom in"
      >
        +
      </button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600" />

      {/* Layout mode segmented control */}
      <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-full p-0.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => handleModeChange(m.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              layoutMode === m.key
                ? "bg-white dark:bg-zinc-500 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
