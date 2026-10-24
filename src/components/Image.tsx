import { useState, type ImgHTMLAttributes } from 'react';
import { Utensils } from 'lucide-react';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  showSkeleton?: boolean;
}

export default function Image({
  src,
  alt = '',
  fill,
  priority,
  className = '',
  sizes,
  loading,
  style,
  showSkeleton = true,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fillClass = fill ? 'absolute inset-0 w-full h-full' : '';
  const loadMode = priority ? 'eager' : (loading || 'lazy');

  if (hasError) {
    return (
      <div
        className={`${fillClass} flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-950 text-zinc-400 p-3 select-none`}
        role="img"
        aria-label={alt || 'PANNELLO'}
      >
        <Utensils className="w-6 h-6 text-[#C8102E]/80 mb-1" />
        {alt && <span className="text-[11px] font-heading font-bold text-zinc-300 text-center line-clamp-1">{alt}</span>}
      </div>
    );
  }

  return (
    <>
      {showSkeleton && !isLoaded && (
        <div
          className={`shimmer-skeleton absolute inset-0 z-0 bg-[var(--bg-surface-elevated)] pointer-events-none transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loadMode}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setHasError(true);
          onError?.(e);
        }}
        className={`${fillClass} ${className} ${
          showSkeleton ? `transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}` : ''
        }`.trim()}
        style={style}
        sizes={sizes}
        {...props}
      />
    </>
  );
}
