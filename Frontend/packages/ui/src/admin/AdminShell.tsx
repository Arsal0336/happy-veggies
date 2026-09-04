import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
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
    'block w-full rounded-md px-3 py-2 text-start text-sm no-underline',
    active ? 'bg-white/15 font-semibold text-white' : 'text-primary-50 hover:bg-white/10',
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
  const groups: AdminNavGroup[] =
    navGroups && navGroups.length > 0
      ? navGroups
      : [{ id: 'main', label: '', items: navItems ?? [] }];

  return (
    <div className={cn('grid min-h-screen bg-background lg:grid-cols-[16rem_1fr]', className)}>
      <nav className="flex flex-col gap-4 bg-primary-800 px-3 py-6 text-primary-foreground" aria-label="Admin">
        <p className="m-0 px-3 text-lg font-bold">{brand}</p>
        <div className="flex flex-1 flex-col gap-5">
          {groups.map((group) => (
            <div key={group.id}>
              {group.label ? (
                <p className="mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-200">
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
                        onClick={item.onClick}
                      >
                        {item.label}
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        className={navLinkClass(!!item.active)}
                        aria-current={item.active ? 'page' : undefined}
                        onClick={item.onClick}
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
        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="justify-start text-primary-50 hover:bg-white/10 hover:text-white"
          >
            Log out
          </Button>
        )}
      </nav>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-6 py-4">
          <div>
            <p className="m-0 text-xs text-muted">{brand}</p>
            <h1 className="m-0 text-2xl font-semibold">{title}</h1>
          </div>
          {userLabel ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Avatar name={userLabel} />
              <span className="hidden sm:inline">{userLabel}</span>
            </div>
          ) : null}
        </header>
        <main className="flex-1 px-6 py-5">{children}</main>
      </div>
    </div>
  );
}
