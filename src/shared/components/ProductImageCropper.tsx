import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { ImageIcon, FileIcon, RefreshIcon, SearchIcon, DragIcon } from '@/shared/components/Icons';

interface ProductImageCropperProps {
  onCrop: (file: File | null) => void;
}

export default function ProductImageCropper({ onCrop }: ProductImageCropperProps) {
  const { locale } = useLocale();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1.0);
  const [minZoom, setMinZoom] = useState<number>(0.5);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset states when starting a new crop
  const resetCropper = () => {
    setImageSrc(null);
    setImageName('');
    setZoom(1.0);
    setMinZoom(0.5);
    setOffset({ x: 0, y: 0 });
    onCrop(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1.0);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    if (!imageRef.current || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerWidth; // 1:1 aspect ratio

    const imgNatWidth = imageRef.current.naturalWidth;
    const imgNatHeight = imageRef.current.naturalHeight;

    const containScale = Math.min(containerWidth / imgNatWidth, containerHeight / imgNatHeight);
    const coverScale = Math.max(containerWidth / imgNatWidth, containerHeight / imgNatHeight);

    const calculatedMinZoom = coverScale > 0 ? (containScale / coverScale) : 0.5;
    setMinZoom(Math.max(0.1, Math.min(1.0, calculatedMinZoom)));
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  // Helper to get image sizes and fit dimensions
  const getDimensions = () => {
    if (!imageRef.current || !containerRef.current) return null;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerWidth; // Aspect ratio 1:1

    const imgNatWidth = imageRef.current.naturalWidth;
    const imgNatHeight = imageRef.current.naturalHeight;

    // Scale to cover container (object-fit: cover equivalent)
    const baseScale = Math.max(containerWidth / imgNatWidth, containerHeight / imgNatHeight);
    const baseWidth = imgNatWidth * baseScale;
    const baseHeight = imgNatHeight * baseScale;

    // Size after applying user zoom
    const zoomedWidth = baseWidth * zoom;
    const zoomedHeight = baseHeight * zoom;

    return {
      containerWidth,
      containerHeight,
      baseWidth,
      baseHeight,
      zoomedWidth,
      zoomedHeight,
      naturalWidth: imgNatWidth,
      naturalHeight: imgNatHeight
    };
  };

  // Clamps offset coordinates and centers dimensions that are smaller than container
  const clampOffsets = (x: number, y: number, currentZoom: number = zoom) => {
    if (!imageRef.current || !containerRef.current) return { x, y };
    const dims = getDimensions();
    if (!dims) return { x, y };

    let clampedX = x;
    if (dims.zoomedWidth <= dims.containerWidth) {
      clampedX = (dims.containerWidth - dims.zoomedWidth) / 2;
    } else {
      const minX = -(dims.zoomedWidth - dims.containerWidth);
      clampedX = Math.min(0, Math.max(minX, x));
    }

    let clampedY = y;
    if (dims.zoomedHeight <= dims.containerHeight) {
      clampedY = (dims.containerHeight - dims.zoomedHeight) / 2;
    } else {
      const minY = -(dims.zoomedHeight - dims.containerHeight);
      clampedY = Math.min(0, Math.max(minY, y));
    }

    return { x: clampedX, y: clampedY };
  };

  // Update offsets when zooming so the image doesn't pop out of bounds
  useEffect(() => {
    if (imageSrc) {
      setOffset(prev => clampOffsets(prev.x, prev.y, zoom));
    }
  }, [zoom, imageSrc]);

  // Perform canvas cropping and convert to WebP whenever position/zoom changes
  const triggerCrop = () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return;
    const dims = getDimensions();
    if (!dims) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High quality square product export resolution (1:1 aspect ratio)
    canvas.width = 800;
    canvas.height = 800;

    // Clear canvas and fill with white
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate source coords on the original/natural image
    // Scale factor from preview container to output canvas
    const scaleFactor = canvas.width / dims.containerWidth;

    const destX = offset.x * scaleFactor;
    const destY = offset.y * scaleFactor;
    const destWidth = dims.zoomedWidth * scaleFactor;
    const destHeight = dims.zoomedHeight * scaleFactor;

    ctx.drawImage(
      imageRef.current,
      destX,
      destY,
      destWidth,
      destHeight
    );

    // Convert canvas content to webp blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageName.replace(/\.[^/.]+$/, "") + '.webp', {
            type: 'image/webp',
          });
          onCrop(croppedFile);
        }
      },
      'image/webp',
      0.85 // quality
    );
  };

  // Run crop trigger after drag or zoom
  useEffect(() => {
    if (imageSrc) {
      const delayTimer = setTimeout(() => {
        triggerCrop();
      }, 200); // debounce canvas export
      return () => clearTimeout(delayTimer);
    }
  }, [offset, zoom, imageSrc]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset(clampOffsets(newX, newY));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setOffset(clampOffsets(newX, newY));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {!imageSrc ? (
        <div className="border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100/50">
          <input
            type="file"
            accept="image/*"
            id="product-file-input"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="product-file-input" className="cursor-pointer space-y-2 block">
            <span className="flex justify-center mb-2">
              <ImageIcon className="w-10 h-10 text-slate-400" />
            </span>
            <span className="text-xs font-black text-slate-700 block">
              {locale === 'ar' ? 'اختر صورة المنتج لبدء قصها' : 'Select product image to start cropping'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block">
              {locale === 'ar' ? 'يدعم صيغ JPG، PNG، إلخ. ويتم تحويلها لـ WebP (1:1)' : 'Supports JPG, PNG, etc. Auto-converts to WebP (1:1)'}
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl border border-slate-200/50">
            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px] flex items-center gap-1.5" title={imageName}>
              <FileIcon className="w-3.5 h-3.5 text-slate-400" /> {imageName}
            </span>
            <button
              type="button"
              onClick={resetCropper}
              className="text-[10px] font-black text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1"
            >
              {locale === 'ar' ? (
                <>تغيير الصورة <RefreshIcon className="w-3 h-3" /></>
              ) : (
                <>Change Image <RefreshIcon className="w-3 h-3" /></>
              )}
            </button>
          </div>

          {/* Interactive Crop Preview Area */}
          <div className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-2xl border border-slate-300 shadow-inner bg-slate-200 select-none">
            <div
              ref={containerRef}
              style={{ width: '100%', aspectRatio: '1 / 1' }}
              className="relative overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                style={{
                  position: 'absolute',
                  left: `${offset.x}px`,
                  top: `${offset.y}px`,
                  width: getDimensions() ? `${getDimensions()?.zoomedWidth}px` : 'auto',
                  height: getDimensions() ? `${getDimensions()?.zoomedHeight}px` : 'auto',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
              
              {/* Semi-transparent grid overlay to help centering */}
              <div className="absolute inset-0 border border-primary/20 pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border-b border-r border-white/20"></div>
                <div className="border-b border-r border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-b border-r border-white/20"></div>
                <div className="border-b border-r border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/50 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-600">
              <span>{zoom.toFixed(2)}x</span>
              <span className="flex items-center gap-1">
                <SearchIcon className="w-3.5 h-3.5 text-slate-400" />
                {locale === 'ar' ? 'التكبير / التصغير' : 'Zoom Level'}
              </span>
            </div>
            <input
              type="range"
              min={minZoom}
              max="3.0"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] font-bold text-slate-400 text-center flex items-center justify-center gap-1">
              <DragIcon className="w-3 h-3 text-slate-400" />
              {locale === 'ar' ? 'اسحب الصورة لتعديل تموضعها داخل الإطار' : 'Drag the image to adjust its position inside the crop mask'}
            </p>
          </div>

          {/* Hidden canvas used for exporting cropped content */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}
