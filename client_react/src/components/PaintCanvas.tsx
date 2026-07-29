import { useRef, useState, useCallback, useEffect } from 'react';

const IMG_RES = 256; // native pixel resolution of generated images

type Props = {
  imageUrl: string | null;
  loading: boolean;
  brushRadius: number;
  disabled: boolean;
  onStrokeComplete: (maskDataUrl: string) => void;
};

export default function PaintCanvas({ imageUrl, loading, brushRadius, disabled, onStrokeComplete }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const painted = useRef(false);
  const [cursor, setCursor] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
  }, []);

  useEffect(() => {
    clearCanvas();
  }, [imageUrl, clearCanvas]);

  const toCanvasCoords = (e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const scale = IMG_RES / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const paintDot = (x: number, y: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const rect = wrapRef.current!.getBoundingClientRect();
    const scale = IMG_RES / rect.width;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x, y, brushRadius * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || loading) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drawing.current = true;
    painted.current = true;
    const { x, y } = toCanvasCoords(e);
    paintDot(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) {
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
    }
    if (!drawing.current || disabled || loading) return;
    const { x, y } = toCanvasCoords(e);
    paintDot(x, y);
  };

  const handlePointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (!painted.current) return;
    painted.current = false;
    const c = canvasRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL('image/png');
    clearCanvas();
    onStrokeComplete(dataUrl);
  };

  return (
    <div
      ref={wrapRef}
      className="relative group overflow-hidden border border-outline-variant select-none"
      style={{ cursor: 'none', aspectRatio: '1 / 1' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setCursor((c) => ({ ...c, visible: false }))}
    >
      {imageUrl && (
        <img alt="GAN generated scene" className="w-full h-full object-cover pointer-events-none" src={imageUrl} />
      )}
      <canvas
        ref={canvasRef}
        width={IMG_RES}
        height={IMG_RES}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply opacity-60"
      />
      {loading && (
        <div className="absolute inset-0 bg-surface/60 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {cursor.visible && !disabled && (
        <div
          className="absolute rounded-full border-2 border-primary bg-primary/10 pointer-events-none"
          style={{
            width: brushRadius * 2,
            height: brushRadius * 2,
            left: cursor.x - brushRadius,
            top: cursor.y - brushRadius,
          }}
        />
      )}
    </div>
  );
}
