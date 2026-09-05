import React, { useState, useRef } from 'react';
import { Plus, Trash2, Upload, Link, Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface MultiGalleryUploaderProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  helperText?: string;
}

const GALLERY_PRESETS = [
  { label: 'Resort Pool', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Excursion Adventure', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { label: 'City Skyline', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Scenic Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Local Cuisine', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
];

export const MultiGalleryUploader: React.FC<MultiGalleryUploaderProps> = ({
  label,
  images = [],
  onChange,
  helperText,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [showAddUrl, setShowAddUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    onChange([...images, newUrl.trim()]);
    setNewUrl('');
    setShowAddUrl(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange([...images, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
            <span>{label}</span>
            <span className="text-[10px] bg-purple-100 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Upload className="w-3 h-3 text-purple-900" />
            <span>Upload Files</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddUrl(!showAddUrl)}
            className="text-[11px] bg-[#2E0249] hover:bg-purple-900 text-[#FFC72C] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Link className="w-3 h-3" />
            <span>Add by URL</span>
          </button>
        </div>
      </div>

      {helperText && <p className="text-[11px] text-neutral-500">{helperText}</p>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Add URL Field */}
      {showAddUrl && (
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex gap-2 items-center animate-in fade-in">
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 text-xs p-2 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-purple-900"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-2 bg-purple-900 hover:bg-[#2E0249] text-white text-xs font-bold rounded-xl whitespace-nowrap"
          >
            Add Image
          </button>
          <button
            type="button"
            onClick={() => setShowAddUrl(false)}
            className="p-2 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thumbnails Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-[4/3] bg-neutral-100 shadow-xs"
            >
              <img
                src={imgUrl}
                alt={`Trip gallery photo ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                #{index + 1}
              </span>
            </div>
          ))}

          {/* Quick Add Placeholder Card */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-neutral-300 hover:border-purple-900 bg-neutral-50/70 hover:bg-purple-50/50 aspect-[4/3] flex flex-col items-center justify-center p-2 text-neutral-500 hover:text-purple-900 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold">Add More</span>
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-purple-300 bg-neutral-50/60 text-center cursor-pointer transition-colors"
        >
          <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
          <p className="text-xs font-semibold text-neutral-700">No additional gallery images added yet</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Click to upload photos or use the button above to paste URLs</p>
        </div>
      )}

      {/* Suggested Gallery Presets */}
      <div className="pt-2">
        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Preset Suggestions (Click to add):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GALLERY_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!images.includes(preset.url)) {
                  onChange([...images, preset.url]);
                }
              }}
              className="text-[10px] font-medium bg-neutral-100 hover:bg-purple-100 text-neutral-700 hover:text-purple-900 border border-neutral-200 px-2 py-0.5 rounded-md transition-colors"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
