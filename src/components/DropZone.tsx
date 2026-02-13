"use client";

import { useCallback, ReactNode } from "react";
import { useAppStore } from "@/lib/store";

interface DropZoneProps {
  children: ReactNode;
  boardId: string;
}

function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

export function DropZone({ children, boardId }: DropZoneProps) {
  const { panX, panY, zoom, addItem, isDraggingOver, setIsDraggingOver } =
    useAppStore();

  const getViewportCenter = useCallback(() => {
    const cx = (window.innerWidth / 2 - panX) / zoom;
    const cy = (window.innerHeight / 2 - panY) / zoom;
    return { cx, cy };
  }, [panX, panY, zoom]);

  const handleUpload = useCallback(
    async (file: File, cx: number, cy: number) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `/api/items?boardId=${boardId}&cx=${cx}&cy=${cy}`,
        { method: "POST", body: formData }
      );
      if (res.ok) {
        const item = await res.json();
        addItem(item);
      }
    },
    [boardId, addItem]
  );

  const handleLink = useCallback(
    async (url: string, cx: number, cy: number) => {
      const res = await fetch(
        `/api/items?boardId=${boardId}&cx=${cx}&cy=${cy}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "link", content: url }),
        }
      );
      if (res.ok) {
        const item = await res.json();
        addItem(item);
      }
    },
    [boardId, addItem]
  );

  const handleText = useCallback(
    async (text: string, cx: number, cy: number) => {
      const res = await fetch(
        `/api/items?boardId=${boardId}&cx=${cx}&cy=${cy}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", content: text }),
        }
      );
      if (res.ok) {
        const item = await res.json();
        addItem(item);
      }
    },
    [boardId, addItem]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const { cx, cy } = getViewportCenter();

      // Check for files
      if (e.dataTransfer.files.length > 0) {
        for (const file of Array.from(e.dataTransfer.files)) {
          await handleUpload(file, cx, cy);
        }
        return;
      }

      // Check for URL text
      const text =
        e.dataTransfer.getData("text/uri-list") ||
        e.dataTransfer.getData("text/plain");
      if (text) {
        if (isUrl(text.trim())) {
          await handleLink(text.trim(), cx, cy);
        } else {
          await handleText(text.trim(), cx, cy);
        }
      }
    },
    [getViewportCenter, handleUpload, handleLink, handleText, setIsDraggingOver]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDraggingOver) setIsDraggingOver(true);
    },
    [isDraggingOver, setIsDraggingOver]
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (e.currentTarget === e.target) {
        setIsDraggingOver(false);
      }
    },
    [setIsDraggingOver]
  );

  const onPaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const { cx, cy } = getViewportCenter();

      // Check for files in clipboard
      if (e.clipboardData.files.length > 0) {
        e.preventDefault();
        for (const file of Array.from(e.clipboardData.files)) {
          await handleUpload(file, cx, cy);
        }
        return;
      }

      // Check for text/URL
      const text = e.clipboardData.getData("text/plain");
      if (text) {
        e.preventDefault();
        if (isUrl(text.trim())) {
          await handleLink(text.trim(), cx, cy);
        } else {
          await handleText(text.trim(), cx, cy);
        }
      }
    },
    [getViewportCenter, handleUpload, handleLink, handleText]
  );

  return (
    <div
      className="relative w-full h-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onPaste={onPaste}
      tabIndex={0}
    >
      {children}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 pointer-events-none border-4 border-dashed border-indigo-500 bg-indigo-500/10 flex items-center justify-center">
          <div className="text-2xl font-semibold text-indigo-400">
            Drop to add
          </div>
        </div>
      )}
    </div>
  );
}
