import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCw, ZoomIn, ZoomOut, Trash2, Upload, Check, RefreshCw } from 'lucide-react';

interface StudentPhotoEditorProps {
  currentPhoto?: string;
  onPhotoCropped: (base64DataUrl: string) => void;
  onPhotoRemoved: () => void;
}

export const StudentPhotoEditor: React.FC<StudentPhotoEditorProps> = ({
  currentPhoto,
  onPhotoCropped,
  onPhotoRemoved,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // in degrees (0, 90, 180, 270)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial photo if exists
  useEffect(() => {
    if (currentPhoto && !currentPhoto.startsWith('https://images.unsplash.com')) {
      // If it's a base64 or custom uploaded photo, keep track of it
      // But only if we don't have an active editor session
    }
  }, [currentPhoto]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar (JPG, JPEG, PNG) yang diperbolehkan.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageSrc) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageSrc || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y,
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleApplyCrop = () => {
    if (!imageSrc) return;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      // We want to crop a square/circle centered at (150, 150)
      ctx.save();
      // Translate to canvas center
      ctx.translate(150, 150);
      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);
      // Apply zoom/scale
      ctx.scale(zoom, zoom);

      // Calculate source image aspect ratio and base drawing sizes
      const containerSize = 200; // Size of the crop preview container in UI
      const scaleFactor = Math.min(300 / img.width, 300 / img.height);
      
      // Let's draw with center alignment
      // Map UI offsets to canvas coordinate space
      // Since UI preview container is 200px and canvas is 300px, we multiply offset by 1.5
      const uiToCanvasScale = 1.5;
      const dx = offset.x * uiToCanvasScale;
      const dy = offset.y * uiToCanvasScale;

      // Draw the image centered
      const drawWidth = img.width * scaleFactor;
      const drawHeight = img.height * scaleFactor;
      ctx.drawImage(img, -drawWidth / 2 + dx / zoom, -drawHeight / 2 + dy / zoom, drawWidth, drawHeight);
      
      ctx.restore();

      // Convert to Base64 (lowered size for storage optimization)
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      onPhotoCropped(croppedBase64);
      setImageSrc(null); // Clear editor state after applying
    };
    img.src = imageSrc;
  };

  const handleCancelEdit = () => {
    setImageSrc(null);
  };

  const handleRemovePhoto = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus foto siswa?")) {
      onPhotoRemoved();
      setImageSrc(null);
    }
  };

  return (
    <div id="student-photo-editor-wrapper" className="space-y-4">
      {/* If currently editing/cropping a selected file */}
      {imageSrc ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center">
          <span className="text-slate-600 text-xs font-bold mb-2 uppercase block">Sesuaikan Foto</span>
          
          {/* Crop Viewport with Circular Overlay */}
          <div 
            ref={containerRef}
            className="w-[200px] h-[200px] relative overflow-hidden bg-slate-200 border border-slate-300 rounded-xl cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
          >
            {/* The Image being edited */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop editor"
              className="absolute pointer-events-none origin-center max-w-none max-h-none"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            />
            {/* Circular Vignette Overlay to guide the user */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-black/40 rounded-xl flex items-center justify-center">
              <div className="w-[170px] h-[170px] rounded-full border border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Geser gambar untuk memposisikan wajah di dalam lingkaran
          </p>

          {/* Controls Bar */}
          <div className="w-full space-y-3 mt-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-brand-600 cursor-pointer h-1.5 bg-slate-150 rounded-lg appearance-none"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-500 w-8 text-right">{zoom.toFixed(2)}x</span>
            </div>

            {/* Action buttons inside editing state */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                title="Putar Foto 90 Derajat"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-lg text-xs font-semibold border border-rose-100 transition-colors"
              >
                <span>Batal</span>
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Default view (shows photo preview + change/delete controls, or upload dropzone) */
        <div className="space-y-3">
          {currentPhoto ? (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200 relative group shadow-sm bg-slate-50">
                <img 
                  src={currentPhoto} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={triggerSelectFile}
                    className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full text-xs transition-all"
                    title="Ganti Foto"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full text-xs transition-all"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action row under photo */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={triggerSelectFile}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Ganti Foto</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-150 border border-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ) : (
            /* Dotted Dropzone Area */
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerSelectFile}
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-slate-50 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-50 text-slate-400 group-hover:text-brand-600 flex items-center justify-center mx-auto mb-2.5">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Pilih Foto Siswa</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Drag & Drop atau klik di sini<br />
                Format: JPG, JPEG, PNG
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
