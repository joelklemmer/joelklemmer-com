import Link from 'next/link';

export interface PrimaryNavItem {
  href: string;
  label: string;
}

export interface PrimaryNavSectionProps {
  items: PrimaryNavItem[];
}

export function PrimaryNavSection({ items }: PrimaryNavSectionProps) {
  return (
    <ul className="primary-nav">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>{item.label}</Link>
        </li>
      ))}
    </ul>
  );
}
