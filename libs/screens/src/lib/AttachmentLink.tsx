import Link from 'next/link';
import type { ReactNode } from 'react';

export function AttachmentLink({
  href,
  filename,
  download,
  className,
  'aria-label': ariaLabel,
  children,
}: {
  href: string;
  filename: string;
  download: string;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      download={download}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
