"use client";

import { useCallback } from "react";
import { useAppStore, ItemData } from "@/lib/store";

interface ItemCardProps {
  item: ItemData;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseMeta(item: ItemData) {
  try {
    return item.metadata ? JSON.parse(item.metadata) : {};
  } catch {
    return {};
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const { removeItem } = useAppStore();

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        removeItem(item.id);
      }
    },
    [item.id, removeItem]
  );

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow">
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        x
      </button>

      {item.type === "image" && <ImageCard item={item} />}
      {item.type === "link" && <LinkCard item={item} />}
      {item.type === "video" && <VideoCard item={item} />}
      {item.type === "text" && <TextCard item={item} />}
      {item.type === "file" && <FileCard item={item} />}
    </div>
  );
}

function ImageCard({ item }: { item: ItemData }) {
  const src = item.thumbnailPath || item.content;
  const meta = parseMeta(item);
  const size = formatBytes(meta.size);
  const dims = meta.originalWidth && meta.originalHeight
    ? `${meta.originalWidth} x ${meta.originalHeight}`
    : null;
  const ext = meta.originalName?.split(".").pop()?.toUpperCase() || "";

  const info = [ext, dims, size].filter(Boolean).join(" · ");

  return (
    <div>
      <img
        src={src}
        alt={item.title || "Image"}
        className="w-full h-auto object-cover"
        draggable={false}
      />
      {info && (
        <div className="px-3 py-2">
          <p className="text-[11px] text-zinc-400 truncate">{info}</p>
        </div>
      )}
    </div>
  );
}

function LinkCard({ item }: { item: ItemData }) {
  const og = parseMeta(item);

  return (
    <div className="flex flex-col">
      {og.image && (
        <img
          src={og.image}
          alt={og.title || ""}
          className="w-full h-36 object-cover"
          draggable={false}
        />
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {og.favicon && (
            <img src={og.favicon} alt="" className="w-4 h-4" draggable={false} />
          )}
          <span className="text-xs text-zinc-400 truncate">
            {(() => {
              try {
                return new URL(item.content).hostname;
              } catch {
                return item.content;
              }
            })()}
          </span>
        </div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {og.title || item.content}
        </h3>
        {og.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
            {og.description}
          </p>
        )}
      </div>
    </div>
  );
}

function VideoCard({ item }: { item: ItemData }) {
  const meta = parseMeta(item);
  const originalUrl = meta.originalUrl || item.content;
  let source = "";
  try { source = new URL(originalUrl).hostname; } catch { /* */ }

  return (
    <div>
      <div className="aspect-video">
        <iframe
          src={item.content}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      {source && (
        <div className="px-3 py-2">
          <p className="text-[11px] text-zinc-400 truncate">{source}</p>
        </div>
      )}
    </div>
  );
}

function TextCard({ item }: { item: ItemData }) {
  return (
    <div className="p-4">
      <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
        {item.content}
      </p>
    </div>
  );
}

function FileCard({ item }: { item: ItemData }) {
  const meta = parseMeta(item);
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-lg">
        F
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {item.title || "File"}
        </p>
        <p className="text-xs text-zinc-400">{formatBytes(meta.size)}</p>
      </div>
    </div>
  );
}
