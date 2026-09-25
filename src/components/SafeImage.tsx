import React, { useState } from 'react';
import { getFallbackImage } from '../utils/imageAssets';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  typeHint?: 'vehicle' | 'part' | 'service';
  categoryHint?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc,
  typeHint = 'part',
  categoryHint,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasFailedOnce, setHasFailedOnce] = useState<boolean>(false);
  const [hasCompletelyFailed, setHasCompletelyFailed] = useState<boolean>(false);

  // Sync if src prop changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasFailedOnce(false);
    setHasCompletelyFailed(false);
  }, [src]);

  const handleError = () => {
    if (!hasFailedOnce) {
      setHasFailedOnce(true);
      const replacement = fallbackSrc || getFallbackImage(typeHint, categoryHint || alt);
      setCurrentSrc(replacement);
    } else {
      setHasCompletelyFailed(true);
    }
  };

  if (hasCompletelyFailed) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container text-outline/60 overflow-hidden ${className}`}
        aria-label={alt}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <span className="material-symbols-outlined text-2xl text-primary/40 mb-1">directions_car</span>
          <span className="text-[10px] font-semibold text-outline line-clamp-1">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};
