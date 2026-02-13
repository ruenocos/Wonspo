"use client";

import { useCallback, useRef, useState } from "react";
import { useAppStore, ItemData } from "@/lib/store";
import { ItemCard } from "./ItemCard";

interface CanvasItemProps {
  item: ItemData;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { updateItem, freeformMode, setSelectedItemId, zoom } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const itemStart = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      setIsDragging(true);
      didMove.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      itemStart.current = { x: item.posX, y: item.posY };
    },
    [item.posX, item.posY]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStart.current.x) / zoom;
      const dy = (e.clientY - dragStart.current.y) / zoom;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didMove.current = true;
      }

      updateItem(item.id, {
        posX: itemStart.current.x + dx,
        posY: itemStart.current.y + dy,
      });
    },
    [isDragging, zoom, item.id, updateItem]
  );

  const onMouseUp = useCallback(async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!didMove.current) {
      setSelectedItemId(item.id);
      return;
    }

    // Save position to server
    const currentItem = useAppStore.getState().items.find((i) => i.id === item.id);
    if (!currentItem) return;

    if (!freeformMode) {
      // Check for nudge
      const allItems = useAppStore.getState().items;
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posX: currentItem.posX, posY: currentItem.posY }),
      });
      if (res.ok) {
        const updated = await res.json();
        updateItem(item.id, { posX: updated.posX, posY: updated.posY });
      }
    } else {
      await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posX: currentItem.posX, posY: currentItem.posY }),
      });
    }
  }, [isDragging, item.id, freeformMode, updateItem, setSelectedItemId]);

  return (
    <div
      className={`absolute select-none group ${isDragging ? "z-50 cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: item.posX,
        top: item.posY,
        width: item.width,
        zIndex: isDragging ? 9999 : item.zIndex,
        transition: isDragging ? "none" : "left 0.2s ease, top 0.2s ease",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => {
        if (isDragging) onMouseUp();
      }}
    >
      <ItemCard item={item} />
    </div>
  );
}
