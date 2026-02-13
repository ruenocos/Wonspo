"use client";

import { useCallback, useRef, useEffect } from "react";
import { useAppStore, ItemData } from "@/lib/store";
import { ItemCard } from "./ItemCard";

interface CanvasItemProps {
  item: ItemData;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { updateItem, setSelectedItemId } = useAppStore();
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const itemStart = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      // Don't start drag if clicking a button (delete, etc.)
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      e.stopPropagation();
      e.preventDefault();
      isDragging.current = true;
      didMove.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      // Read fresh position from store at drag start
      const fresh = useAppStore.getState().items.find((i) => i.id === item.id);
      itemStart.current = {
        x: fresh?.posX ?? item.posX,
        y: fresh?.posY ?? item.posY,
      };
    },
    [item.id, item.posX, item.posY]
  );

  // Window-level mousemove/mouseup so fast drags don't lose the cursor
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const z = useAppStore.getState().zoom;
      const dx = (e.clientX - dragStart.current.x) / z;
      const dy = (e.clientY - dragStart.current.y) / z;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didMove.current = true;
      }

      updateItem(item.id, {
        posX: itemStart.current.x + dx,
        posY: itemStart.current.y + dy,
      });
    };

    const onMouseUp = async () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (!didMove.current) {
        setSelectedItemId(item.id);
        return;
      }

      const currentItem = useAppStore.getState().items.find((i) => i.id === item.id);
      if (!currentItem) return;

      // Save position to server
      await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posX: currentItem.posX, posY: currentItem.posY }),
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [item.id, updateItem, setSelectedItemId]);

  return (
    <div
      className="absolute select-none group cursor-grab active:cursor-grabbing"
      style={{
        left: item.posX,
        top: item.posY,
        width: item.width,
        zIndex: item.zIndex,
        transition: "left 0.2s ease, top 0.2s ease",
      }}
      onMouseDown={onMouseDown}
    >
      <ItemCard item={item} />
    </div>
  );
}
