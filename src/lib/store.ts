"use client";

import { create } from "zustand";

export type LayoutMode = "auto" | "tidy" | "freeform";

export interface ItemData {
  id: string;
  boardId: string;
  userId: string;
  type: string;
  title: string | null;
  content: string;
  thumbnailPath: string | null;
  metadata: string | null;
  note: string | null;
  posX: number;
  posY: number;
  width: number;
  height: number;
  zIndex: number;
  createdAt: string;
  tags?: { tag: { id: string; name: string; color: string } }[];
}

export interface BoardData {
  id: string;
  name: string;
  backgroundColor: string | null;
}

export interface UploadTask {
  id: string;
  name: string;
  status: "uploading" | "processing" | "done" | "error";
}

interface AppState {
  // Canvas
  panX: number;
  panY: number;
  zoom: number;
  setPan: (x: number, y: number) => void;
  setZoom: (z: number) => void;

  // Items
  items: ItemData[];
  setItems: (items: ItemData[]) => void;
  addItem: (item: ItemData) => void;
  updateItem: (id: string, updates: Partial<ItemData>) => void;
  removeItem: (id: string) => void;

  // Boards
  boards: BoardData[];
  setBoards: (boards: BoardData[]) => void;
  activeBoardId: string;
  setActiveBoardId: (id: string) => void;

  // UI
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  isDraggingOver: boolean;
  setIsDraggingOver: (v: boolean) => void;

  // Upload queue
  uploads: UploadTask[];
  addUpload: (task: UploadTask) => void;
  updateUpload: (id: string, updates: Partial<UploadTask>) => void;
  removeUpload: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  panX: 0,
  panY: 0,
  zoom: 1,
  setPan: (x, y) => set({ panX: x, panY: y }),
  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(3, z)) }),

  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  updateItem: (id, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  boards: [],
  setBoards: (boards) => set({ boards }),
  activeBoardId: "default-board",
  setActiveBoardId: (id) => set({ activeBoardId: id }),

  layoutMode: "auto",
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  isDraggingOver: false,
  setIsDraggingOver: (v) => set({ isDraggingOver: v }),

  uploads: [],
  addUpload: (task) => set((s) => ({ uploads: [...s.uploads, task] })),
  updateUpload: (id, updates) =>
    set((s) => ({
      uploads: s.uploads.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    })),
  removeUpload: (id) =>
    set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),
}));
