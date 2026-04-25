import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

interface SpriteWithFallbackProps {
  src: string;
  size: number;
  alt: string;
  fallback: ReactNode;
  style?: CSSProperties;
}

/**
 * Renders a PNG sprite from /public/sprites/ if it exists, otherwise falls
 * back to the SVG pixel-grid children. The app ships working either way —
 * dropping a PNG with the expected filename into public/sprites/ takes over.
 *
 * We probe the file with a cheap HEAD request (cached by the browser) so the
 * fallback decision is made once per src per session.
 *
 * NOTE: This is a placeholder for the future `react-aseprite-sprite` package
 * (sibling repo at ../react-aseprite-sprite). Once that ships, swap this
 * component for the library's <Sprite> — it adds a third tier that plays
 * animated Aseprite sheets above both of the tiers here.
 */
export function SpriteWithFallback({ src, size, alt, fallback, style }: SpriteWithFallbackProps) {
  const [status, setStatus] = useState<'probing' | 'found' | 'missing'>('probing');

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setStatus('found');
    };
    img.onerror = () => {
      if (!cancelled) setStatus('missing');
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (status === 'found') {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          ...style,
        }}
      />
    );
  }

  // 'probing' or 'missing' — render the SVG fallback immediately so there's
  // no visible flash. When probing succeeds, we swap to the PNG.
  return <>{fallback}</>;
}
