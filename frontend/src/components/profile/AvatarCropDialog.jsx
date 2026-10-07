import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FaCrop, FaSearchPlus, FaSearchMinus, FaSync } from 'react-icons/fa';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import { compressAvatar } from '../../utils/compressAvatar';
import { toast } from 'react-toastify';

/**
 * Dialog for cropping and compressing a chosen user profile photo.
 */
export const AvatarCropDialog = ({
  isOpen,
  onClose,
  imageSrc,
  onPhotoUploaded,
}) => {
  const imageRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploadPhase, setUploadPhase] = useState(null); // 'optimizing' | 'uploading' | null
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mouse Dragging for crop alignment
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Crop & Set Photo action
  const handleCropAndSave = async () => {
    if (!imageRef.current) return;
    setUploadPhase('optimizing');
    setUploadProgress(0);

    try {
      const img = imageRef.current;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Draw onto 400x400 canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // The viewport frame is 280x280
      const VIEWPORT_SIZE = 280;
      const TARGET_SIZE = 400;
      const scale = TARGET_SIZE / VIEWPORT_SIZE;

      // Calculate displayed image bounds in the 280x280 viewport
      const aspect = naturalWidth / naturalHeight;
      let displayWidth, displayHeight;
      if (aspect >= 1) {
        displayHeight = VIEWPORT_SIZE * zoom;
        displayWidth = displayHeight * aspect;
      } else {
        displayWidth = VIEWPORT_SIZE * zoom;
        displayHeight = displayWidth / aspect;
      }

      // Center baseline plus user offset
      const cx = (VIEWPORT_SIZE - displayWidth) / 2 + offset.x;
      const cy = (VIEWPORT_SIZE - displayHeight) / 2 + offset.y;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
      ctx.drawImage(
        img,
        cx * scale,
        cy * scale,
        displayWidth * scale,
        displayHeight * scale
      );

      // Convert to blob
      const croppedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      });

      // Compress avatar (<100KB)
      setUploadProgress(30);
      const compressionResult = await compressAvatar(croppedBlob, (p) => {
        setUploadProgress(30 + Math.round(p * 0.4));
      });

      setUploadPhase('uploading');
      setUploadProgress(75);

      await onPhotoUploaded(compressionResult.compressedFile);
      setUploadProgress(100);

      toast.success('Profile photo updated successfully!');
      onClose();
    } catch (err) {
      console.error('Crop & Upload failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile photo.');
    } finally {
      setUploadPhase(null);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (!uploadPhase) {
          onClose();
        }
      }}
      title="Crop & Set Profile Photo"
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
          Drag to reposition and adjust the zoom slider to center your face inside the circle.
        </p>

        {/* Interactive Crop Viewport */}
        <div
          className="relative w-[280px] h-[280px] mx-auto overflow-hidden bg-neutral-900 rounded-2xl border-2 border-[var(--md-sys-color-primary)] select-none cursor-move flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                maxHeight: 'none',
                maxWidth: 'none',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              className="transition-transform duration-75"
            />
          )}

          {/* Circular Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
        </div>

        {/* Zoom Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
            <span className="flex items-center gap-1">
              <FaSearchMinus className="text-[10px]" /> Zoom Out
            </span>
            <span className="font-mono">{Math.round(zoom * 100)}%</span>
            <span className="flex items-center gap-1">
              Zoom In <FaSearchPlus className="text-[10px]" />
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            disabled={!!uploadPhase}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer"
          />
        </div>

        {/* Upload Progress Status Indicator */}
        {uploadPhase && (
          <div className="p-3 bg-[var(--md-sys-color-surface-container)] rounded-xl border border-[var(--md-sys-color-outline-variant)] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--md-sys-color-primary)]">
              <span className="flex items-center gap-2">
                <FaSync className="animate-spin text-xs" />
                {uploadPhase === 'optimizing'
                  ? 'Optimizing photo (Pillow & WebWorker)...'
                  : 'Uploading to secure storage...'}
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] overflow-hidden">
              <div
                className="h-full bg-[var(--md-sys-color-primary)] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="text"
            onClick={onClose}
            disabled={!!uploadPhase}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="filled"
            onClick={handleCropAndSave}
            loading={!!uploadPhase}
            icon={<FaCrop className="text-xs" />}
          >
            Crop & Set Photo
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

AvatarCropDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageSrc: PropTypes.string,
  onPhotoUploaded: PropTypes.func.isRequired,
};

export default AvatarCropDialog;
