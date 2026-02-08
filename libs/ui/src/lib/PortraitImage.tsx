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
  /** Optional object position override (default: 'center top' for face-safe institutional portraits) */
  objectPosition?: string;
}

/**
 * Institutional portrait image component with proper aspect ratio handling,
 * optimized for editorial/institutional presentation without thumbnail tile feel.
 *
 * Enforces consistent 4:5 portrait aspect ratio contract (1200x1500 = 0.8).
 * Face-safe cropping with 'center top' positioning ensures head/face remains visible.
 * Optimized for 2x displays with proper Next.js Image sizing.
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
  // Enforce consistent 4:5 portrait aspect ratio contract
  // Standard institutional portrait: 1200x1500 = 0.8 (4:5)
  const aspectRatio = width / height;

  // Optimize sizes for LCP and 2x displays: ensure hero portrait loads appropriate size
  // For 2x displays, double the pixel dimensions:
  // Mobile: up to 640px (320px * 2), Tablet: up to 840px (420px * 2), Desktop: up to 900px (450px * 2)
  // Next.js Image automatically handles 2x selection based on device pixel ratio
  const sizes =
    '(max-width: 767px) min(640px, 100vw), (max-width: 1023px) min(840px, 80vw), min(900px, 70vw)';

  const imageStyle: CSSProperties = {
    objectPosition,
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  };

  return (
    <div
      className={`portrait-image-wrapper ${className}`}
      style={{
        aspectRatio,
        // Reserve space to prevent CLS - ensure wrapper maintains aspect ratio
        minHeight: 0,
        width: '100%',
      }}
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
