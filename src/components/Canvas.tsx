"use client";

import { useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { CanvasItem } from "./CanvasItem";

export function Canvas() {
  const { panX, panY, zoom, setPan, setZoom, items } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.002;
        setZoom(zoom + delta);
      } else {
        // Pan
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    },
    [panX, panY, zoom, setPan, setZoom]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Keyboard: spacebar for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        spaceDown.current = true;
        if (containerRef.current) {
          containerRef.current.style.cursor = "grab";
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceDown.current = false;
        isPanning.current = false;
        if (containerRef.current) {
          containerRef.current.style.cursor = "default";
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button or spacebar held
      if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
        isPanning.current = true;
        panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
        if (containerRef.current) {
          containerRef.current.style.cursor = "grabbing";
        }
        e.preventDefault();
      }
    },
    [panX, panY]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning.current) {
        setPan(e.clientX - panStart.current.x, e.clientY - panStart.current.y);
      }
    },
    [setPan]
  );

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = spaceDown.current
        ? "grab"
        : "default";
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative canvas-dots"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {items.map((item) => (
          <CanvasItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
