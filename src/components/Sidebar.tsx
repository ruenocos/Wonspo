"use client";

import { useState, useCallback } from "react";
import { useAppStore, BoardData } from "@/lib/store";

export function Sidebar() {
  const { boards, setBoards, activeBoardId, setActiveBoardId, setPan, setZoom } =
    useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [bgColor, setBgColor] = useState("");

  const createBoard = useCallback(async () => {
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Board" }),
    });
    if (res.ok) {
      const board = await res.json();
      setBoards([...boards, board]);
      setActiveBoardId(board.id);
      setPan(0, 0);
      setZoom(1);
    }
  }, [boards, setBoards, setActiveBoardId, setPan, setZoom]);

  const switchBoard = useCallback(
    (id: string) => {
      setActiveBoardId(id);
      setPan(0, 0);
      setZoom(1);
    },
    [setActiveBoardId, setPan, setZoom]
  );

  const startEditing = useCallback((board: BoardData) => {
    setEditingId(board.id);
    setEditName(board.name);
    setBgColor(board.backgroundColor || "");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingId) return;
    const body: Record<string, string> = { name: editName };
    if (bgColor) body.backgroundColor = bgColor;

    const res = await fetch(`/api/boards/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setBoards(boards.map((b) => (b.id === editingId ? updated : b)));
    }
    setEditingId(null);
  }, [editingId, editName, bgColor, boards, setBoards]);

  const deleteBoard = useCallback(
    async (id: string) => {
      if (id === "default-board") return;
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBoards(boards.filter((b) => b.id !== id));
        if (activeBoardId === id) {
          setActiveBoardId("default-board");
          setPan(0, 0);
          setZoom(1);
        }
      }
    },
    [boards, activeBoardId, setBoards, setActiveBoardId, setPan, setZoom]
  );

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 z-40 h-full w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Wonspo
              </h1>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-1">
              {boards.map((board) => (
                <div key={board.id} className="group">
                  {editingId === board.id ? (
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 space-y-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="w-full px-2 py-1 text-sm rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-500">BG:</label>
                        <input
                          type="color"
                          value={bgColor || "#1a1a1a"}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer"
                        />
                        <button
                          onClick={saveEdit}
                          className="ml-auto text-xs text-indigo-500 hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        activeBoardId === board.id
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                      onClick={() => switchBoard(board.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {board.backgroundColor && (
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: board.backgroundColor }}
                          />
                        )}
                        <span className="text-sm truncate">{board.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(board);
                          }}
                          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {board.id !== "default-board" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBoard(board.id);
                            }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 text-xs"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={createBoard}
              className="mt-4 w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              + New Board
            </button>
          </div>
        </>
      )}
    </>
  );
}
