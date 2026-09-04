import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf, LogOut, Menu, X } from 'lucide-react';
import { Button } from '../primitives/Button';
import { Avatar } from '../layouts/Avatar';
import { cn } from '../utils/cn';

export type AdminNavItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export type AdminShellProps = {
  title: string;
  navItems?: AdminNavItem[];
  navGroups?: AdminNavGroup[];
  children?: ReactNode;
  onLogout?: () => void;
  brand?: string;
  userLabel?: string;
  className?: string;
};

function navLinkClass(active: boolean) {
  return cn(
    'block w-full rounded-lg px-3 py-2 text-start text-sm no-underline transition-colors',
    active
      ? 'bg-white/15 font-semibold text-white shadow-sm'
      : 'text-primary-100 hover:bg-white/10 hover:text-white',
  );
}

function SidebarNav({
  brand,
  groups,
  onLogout,
  onNavigate,
}: {
  brand: string;
  groups: AdminNavGroup[];
  onLogout?: () => void;
  onNavigate?: () => void;
}) {
  const brandTitle = brand.replace(/\s+Admin$/i, '').trim() || 'Happy Veggie';

  return (
    <>
      <div className="relative flex items-center gap-2.5 px-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <Leaf className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate font-display text-base font-bold leading-tight">{brandTitle}</p>
          <p className="m-0 text-[0.65rem] font-medium uppercase tracking-wider text-primary-200">
            Admin
          </p>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.id}>
            {group.label ? (
              <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-300">
                {group.label}
              </p>
            ) : null}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive }) => navLinkClass(isActive || !!item.active)}
                      onClick={() => {
                        item.onClick?.();
                        onNavigate?.();
                      }}
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    <button
                      type="button"
                      className={navLinkClass(!!item.active)}
                      aria-current={item.active ? 'page' : undefined}
                      onClick={() => {
                        item.onClick?.();
                        onNavigate?.();
                      }}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {onLogout ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="relative justify-start gap-2 text-primary-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </Button>
      ) : null}
    </>
  );
}

export function AdminShell({
  title,
  navItems,
  navGroups,
  children,
  onLogout,
  brand = 'Happy Veggie Admin',
  userLabel,
  className,
}: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const groups: AdminNavGroup[] =
    navGroups && navGroups.length > 0
      ? navGroups
      : [{ id: 'main', label: '', items: navItems ?? [] }];

  return (
    <div className={cn('flex min-h-dvh bg-bg', className)}>
      <nav
        className="relative hidden w-[15.5rem] shrink-0 flex-col gap-5 overflow-hidden bg-primary-900 px-3 py-6 text-primary-foreground lg:flex"
        aria-label="Admin"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgb(61 158 88 / 0.35), transparent 55%)',
          }}
        />
        <SidebarNav brand={brand} groups={groups} onLogout={onLogout} />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-sm transition hover:bg-primary-50 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="min-w-0">
              <p className="m-0 truncate text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                {brand}
              </p>
              <h1 className="m-0 truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
                {title}
              </h1>
            </div>
          </div>
          {userLabel ? (
            <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface px-2 py-1.5 pe-3 shadow-sm">
              <Avatar name={userLabel} />
              <span className="hidden max-w-[12rem] truncate text-sm font-medium text-muted sm:inline">
                {userLabel}
              </span>
            </div>
          ) : null}
        </header>

        <main className="hv-rise flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>

      {menuOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-neutral-900/45 backdrop-blur-[2px] lg:hidden"
            role="presentation"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="fixed inset-y-0 left-0 z-50 flex w-[min(16.5rem,88vw)] flex-col gap-5 overflow-hidden bg-primary-900 px-3 py-5 text-primary-foreground shadow-lg lg:hidden"
            aria-label="Admin menu"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse at top left, rgb(61 158 88 / 0.35), transparent 55%)',
              }}
            />
            <div className="relative flex justify-end">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-100 hover:bg-white/10"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <SidebarNav
              brand={brand}
              groups={groups}
              onLogout={onLogout}
              onNavigate={() => setMenuOpen(false)}
            />
          </nav>
        </>
      ) : null}
    </div>
  );
}
