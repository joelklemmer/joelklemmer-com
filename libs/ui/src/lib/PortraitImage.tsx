import Image from 'next/image';
import { type CSSProperties } from 'react';

export interface PortraitImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional priority for LCP optimization */
  priority?: boolean;
  /** Optional quality override (default: 90) */
  quality?: number;
  /** Optional className for additional styling */
  className?: string;
  /** Optional object position override (default: 'center top' for institutional portraits) */
  objectPosition?: string;
}

/**
 * Institutional portrait image component with proper aspect ratio handling,
 * optimized for editorial/institutional presentation without thumbnail tile feel.
 */
export function PortraitImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 90,
  className = '',
  objectPosition = 'center top',
}: PortraitImageProps) {
  // Calculate aspect ratio from dimensions
  const aspectRatio = width / height;

  // Optimize sizes for LCP: ensure hero portrait loads appropriate size
  // Mobile: full width up to 320px, Tablet: up to 420px, Desktop: up to 450px
  const sizes =
    '(max-width: 767px) min(320px, 100vw), (max-width: 1023px) min(420px, 40vw), min(450px, 35vw)';

  const imageStyle: CSSProperties = {
    objectPosition,
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  };

  return (
    <div
      className={`portrait-image-wrapper ${className}`}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        style={imageStyle}
        className="portrait-image"
      />
    </div>
  );
}
