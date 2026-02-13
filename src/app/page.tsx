"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { DropZone } from "@/components/DropZone";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { Sidebar } from "@/components/Sidebar";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { activeBoardId, setItems, setBoards, boards, items } = useAppStore();

  // Load boards on mount
  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then((data) => setBoards(data))
      .catch(console.error);
  }, [setBoards]);

  // Load items when board changes
  useEffect(() => {
    fetch(`/api/items?boardId=${activeBoardId}`)
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(console.error);
  }, [activeBoardId, setItems]);

  // Get current board for background color
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  return (
    <main
      className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950"
      style={
        activeBoard?.backgroundColor
          ? { backgroundColor: activeBoard.backgroundColor }
          : undefined
      }
    >
      <DropZone boardId={activeBoardId}>
        <Canvas />
      </DropZone>
      <Sidebar />
      <Toolbar />
      <ItemDetailModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />

      {/* Empty state */}
      {items.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <p className="text-2xl font-semibold text-zinc-400 dark:text-zinc-600 mb-2">
              Drop anything here
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-600">
              Images, links, videos, text — drag & drop or paste (Ctrl+V)
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
