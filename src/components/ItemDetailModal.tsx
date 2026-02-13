"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppStore, ItemData } from "@/lib/store";

export function ItemDetailModal() {
  const { selectedItemId, setSelectedItemId, items, updateItem, removeItem } =
    useAppStore();
  const item = items.find((i) => i.id === selectedItemId);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (item) {
      setNote(item.note || "");
    }
  }, [item]);

  const saveNote = useCallback(async () => {
    if (!item) return;
    updateItem(item.id, { note });
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
  }, [item, note, updateItem]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      removeItem(item.id);
      setSelectedItemId(null);
    }
  }, [item, removeItem, setSelectedItemId]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setSelectedItemId(null)}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="relative">
          {item.type === "image" && (
            <img
              src={item.content}
              alt={item.title || "Image"}
              className="w-full rounded-t-2xl"
            />
          )}
          {item.type === "video" && (
            <div className="aspect-video">
              <iframe
                src={item.content}
                className="w-full h-full rounded-t-2xl"
                allowFullScreen
              />
            </div>
          )}
          {item.type === "link" && <LinkDetail item={item} />}
          {item.type === "text" && (
            <div className="p-6">
              <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap text-lg">
                {item.content}
              </p>
            </div>
          )}
          {item.type === "file" && (
            <div className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl text-zinc-500">
                F
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title || "File"}
                </p>
                <a
                  href={item.content}
                  download
                  className="text-sm text-indigo-500 hover:underline"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Metadata + Note */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          {item.title && item.type !== "link" && (
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {item.title}
            </h2>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-zinc-400 mb-4">
            <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            {(item.type === "image" || item.type === "file") && (() => {
              try {
                const meta = JSON.parse(item.metadata || "{}");
                const parts: string[] = [];
                if (meta.originalWidth && meta.originalHeight) {
                  parts.push(`${meta.originalWidth} x ${meta.originalHeight}`);
                }
                if (meta.size) {
                  const b = meta.size;
                  parts.push(b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);
                }
                return parts.length > 0 ? <span>{parts.join(" · ")}</span> : null;
              } catch { return null; }
            })()}
            {item.type === "link" && (
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                Open link
              </a>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedItemId(null)}
              className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkDetail({ item }: { item: ItemData }) {
  let og: { title?: string; description?: string; image?: string; url?: string } = {};
  try {
    og = item.metadata ? JSON.parse(item.metadata) : {};
  } catch {
    // ignore
  }

  return (
    <div>
      {og.image && (
        <img src={og.image} alt={og.title || ""} className="w-full rounded-t-2xl" />
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {og.title || item.title}
        </h3>
        {og.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {og.description}
          </p>
        )}
        <a
          href={item.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-500 hover:underline mt-2 block"
        >
          {item.content}
        </a>
      </div>
    </div>
  );
}
