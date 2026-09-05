import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon, Check, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  aspectRatio?: 'landscape' | 'square' | 'portrait';
  presets?: { label: string; url: string }[];
}

const DEFAULT_TRAVEL_PRESETS = [
  { label: 'Jamaica Beach', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tropical Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Paris Eiffel', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Dubai Marina', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bali Temple', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Luxury Resort', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'landscape',
  presets = DEFAULT_TRAVEL_PRESETS,
}) => {
  const [mode, setMode] = useState<'url' | 'upload' | 'presets'>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        setUrlInput(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-800">{label}</label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {/* Current Preview or Placeholder */}
      <div className="relative group">
        {value ? (
          <div
            className={`relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 ${
              aspectRatio === 'square'
                ? 'aspect-square w-28'
                : aspectRatio === 'portrait'
                ? 'aspect-[3/4] max-w-[180px]'
                : 'aspect-[16/9] w-full max-h-48'
            }`}
          >
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback image if broken
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-neutral-100"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          /* Empty Dropzone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#FFC72C] bg-amber-50/50'
                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/70 hover:bg-neutral-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#2E0249] flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-5 h-5 text-purple-900" />
            </div>
            <p className="text-xs font-bold text-neutral-800">
              Drag & drop image file or <span className="text-purple-900 underline">browse device</span>
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">Supports JPG, PNG, WEBP, GIF</p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Mode Switches */}
      <div className="flex items-center gap-2 pt-1">
        <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              mode === 'url' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Link className="w-3 h-3" />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              fileInputRef.current?.click();
            }}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              mode === 'upload' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('presets')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              mode === 'presets' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Presets</span>
          </button>
        </div>
      </div>

      {/* Mode Content */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 text-xs p-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-purple-900"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl"
          >
            Apply URL
          </button>
        </div>
      )}

      {mode === 'presets' && presets && presets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(p.url);
                setUrlInput(p.url);
              }}
              className={`relative rounded-xl overflow-hidden border text-left group aspect-[4/3] ${
                value === p.url ? 'ring-2 ring-[#FFC72C] border-purple-900' : 'border-neutral-200'
              }`}
            >
              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1 flex items-end">
                <span className="text-[9px] font-bold text-white truncate w-full">{p.label}</span>
              </div>
              {value === p.url && (
                <span className="absolute top-1 right-1 bg-[#FFC72C] text-[#2E0249] p-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {helperText && <p className="text-[10px] text-neutral-500">{helperText}</p>}
    </div>
  );
};
