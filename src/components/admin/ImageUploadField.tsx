import React, { useState, useRef } from 'react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helpText?: string;
  placeholder?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helpText = 'Sube un archivo de imagen (PNG, JPG, WebP) o pega un enlace web directo',
  placeholder = 'https://ejemplo.com/imagen.jpg',
  aspectRatio = '16:9',
  required = false,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP, SVG).');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageError(false);
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      default:
        return 'h-40';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#212955] flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[#F07F00]">*</span>}
        </label>
        {/* Toggle between File upload and URL */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-[#9D9D9C]/20 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-white text-[#212955] shadow-xs'
                : 'text-gray-500 hover:text-[#212955]'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
              mode === 'url'
                ? 'bg-white text-[#212955] shadow-xs'
                : 'text-gray-500 hover:text-[#212955]'
            }`}
          >
            Enlace URL
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{errorMsg}</span>
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-red-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragActive
                ? 'border-[#F07F00] bg-[#F07F00]/5'
                : 'border-[#9D9D9C]/40 bg-gray-50/60 hover:bg-gray-100/70 hover:border-[#212955]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#212955]/10 text-[#212955] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">upload_file</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#212955]">
                Haz clic para subir o arrastra una imagen aquí
              </p>
              <p className="text-[11px] text-gray-500">{helpText}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => {
                setImageError(false);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] focus:outline-none focus:border-[#F07F00] min-h-[40px]"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                title="Limpiar enlace"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-500">{helpText}</p>
        </div>
      )}

      {/* Preview Box if image exists */}
      {value && (
        <div className="relative mt-2 rounded-xl overflow-hidden border border-[#9D9D9C]/30 bg-gray-900 group">
          <div className={`w-full max-h-48 overflow-hidden flex items-center justify-center bg-gray-100 ${getAspectClass()}`}>
            {imageError ? (
              <div className="p-4 text-center text-xs text-red-500 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-2xl">broken_image</span>
                <span>No se pudo cargar la imagen desde la ruta especificada</span>
              </div>
            ) : (
              <img
                src={value}
                alt="Vista previa"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={() => {
                if (mode === 'upload') {
                  fileInputRef.current?.click();
                } else {
                  onChange('');
                }
              }}
              className="bg-white text-[#212955] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">cached</span>
              <span>Cambiar imagen</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-700 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              <span>Quitar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
