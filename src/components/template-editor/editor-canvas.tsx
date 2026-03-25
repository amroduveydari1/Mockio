"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Image as KImage, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { EditorLogoArea } from "@/lib/template-editor-utils";
import {
  computeScale,
  scaleLogoAreaForDisplay,
  canvasToImageCoords,
} from "@/lib/template-editor-utils";

interface EditorCanvasProps {
  imageUrl: string;
  logoArea: EditorLogoArea;
  onChange: (area: EditorLogoArea) => void;
  containerWidth?: number;
  containerHeight?: number;
}

export default function EditorCanvas({
  imageUrl,
  logoArea,
  onChange,
  containerWidth = 720,
  containerHeight = 540,
}: EditorCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  const rectRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const scale = imgSize.w > 0 ? computeScale(imgSize.w, imgSize.h, containerWidth, containerHeight) : 1;
  const stageW = Math.round(imgSize.w * scale);
  const stageH = Math.round(imgSize.h * scale);

  // Attach transformer to rect
  useEffect(() => {
    if (trRef.current && rectRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [image, logoArea]);

  const canvasArea = scaleLogoAreaForDisplay(logoArea, scale);

  // Handle drag end — convert canvas position back to original image coords
  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const imgPos = canvasToImageCoords(
        { x: node.x(), y: node.y() },
        scale
      );
      onChange({
        ...logoArea,
        x: imgPos.x,
        y: imgPos.y,
      });
    },
    [logoArea, onChange, scale]
  );

  // Handle transform end (resize via handles) — convert back to original image coords
  const handleTransformEnd = useCallback(() => {
    const node = rectRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset node scale so Konva doesn't compound it next render
    node.scaleX(1);
    node.scaleY(1);

    // Canvas-space values after transform
    const canvasX = node.x();
    const canvasY = node.y();
    const canvasW = node.width() * scaleX;
    const canvasH = node.height() * scaleY;

    // Convert everything back to original image coordinates
    const imgPos = canvasToImageCoords({ x: canvasX, y: canvasY }, scale);
    const imgSize = canvasToImageCoords({ x: canvasW, y: canvasH }, scale);

    onChange({
      ...logoArea,
      x: imgPos.x,
      y: imgPos.y,
      width: Math.max(10, imgSize.x),
      height: Math.max(10, imgSize.y),
    });
  }, [logoArea, onChange, scale]);

  // Draw-to-create: mouse down on stage background
  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only if clicking the stage background (not the rect)
      if (e.target !== e.target.getStage()) return;
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      setDrawing(true);
      setDrawStart({ x: pos.x, y: pos.y });
    },
    []
  );

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!drawing || !drawStart) return;
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      // Canvas-space rectangle from drag
      const canvasX = Math.min(drawStart.x, pos.x);
      const canvasY = Math.min(drawStart.y, pos.y);
      const canvasW = Math.abs(pos.x - drawStart.x);
      const canvasH = Math.abs(pos.y - drawStart.y);

      // Convert to original image coordinates
      const imgPos = canvasToImageCoords({ x: canvasX, y: canvasY }, scale);
      const imgSize = canvasToImageCoords({ x: canvasW, y: canvasH }, scale);

      onChange({
        ...logoArea,
        x: imgPos.x,
        y: imgPos.y,
        width: Math.max(10, imgSize.x),
        height: Math.max(10, imgSize.y),
      });
    },
    [drawing, drawStart, logoArea, onChange, scale]
  );

  const handleStageMouseUp = useCallback(() => {
    setDrawing(false);
    setDrawStart(null);
  }, []);

  if (!image) {
    return (
      <div
        className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl"
        style={{ width: containerWidth, height: containerHeight }}
      >
        <p className="text-sm text-zinc-400">Loading template image...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 inline-block">
      <Stage
        width={stageW}
        height={stageH}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer>
          {/* Template background */}
          <KImage image={image} width={stageW} height={stageH} listening={false} />

          {/* Logo placement rectangle */}
          <Rect
            ref={rectRef}
            x={canvasArea.x}
            y={canvasArea.y}
            width={canvasArea.width}
            height={canvasArea.height}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth={2}
            dash={[6, 4]}
            draggable
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />

          {/* Resize handles */}
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              // Enforce minimum size
              if (newBox.width < 20 || newBox.height < 20) return oldBox;
              return newBox;
            }}
            anchorStroke="#3b82f6"
            anchorFill="#fff"
            anchorSize={10}
            borderStroke="#3b82f6"
            borderStrokeWidth={1}
            borderDash={[4, 3]}
          />
        </Layer>
      </Stage>
    </div>
  );
}
