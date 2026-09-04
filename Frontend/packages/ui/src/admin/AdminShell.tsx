import type { ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { cn } from '../utils/cn';

export type AdminNavItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

export type AdminShellProps = {
  title: string;
  navItems: AdminNavItem[];
  children?: ReactNode;
  onLogout?: () => void;
  brand?: string;
  className?: string;
};

export function AdminShell({
  title,
  navItems,
  children,
  onLogout,
  brand = 'Happy Veggie Admin',
  className,
}: AdminShellProps) {
  return (
    <div className={cn('hv-admin-shell', className)}>
      <nav className="hv-admin-shell__nav" aria-label="Admin">
        <p className="hv-admin-shell__brand">{brand}</p>
        <ul className="hv-admin-shell__links">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <a
                  href={item.href}
                  className="hv-admin-shell__link"
                  aria-current={item.active ? 'page' : undefined}
                  onClick={item.onClick}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  className="hv-admin-shell__link"
                  aria-current={item.active ? 'page' : undefined}
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
        {onLogout && (
          <Button variant="ghost" size="sm" onClick={onLogout} style={{ color: 'inherit' }}>
            Log out
          </Button>
        )}
      </nav>
      <div className="hv-admin-shell__main">
        <header className="hv-admin-shell__header">
          <h1 className="hv-admin-shell__title">{title}</h1>
        </header>
        <main className="hv-admin-shell__content">{children}</main>
      </div>
    </div>
  );
}
