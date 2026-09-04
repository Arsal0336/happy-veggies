import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, ClipboardList, House, Leaf, Menu, Sprout } from 'lucide-react';
import { cn } from '../utils/cn';
import { Drawer } from '../primitives/Drawer';
import { Avatar } from './Avatar';

export type FarmerShellMoreItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export type FarmerShellLabels = {
  farms: string;
  home: string;
  plan: string;
  assistant: string;
  more: string;
  moreTitle: string;
};

export type FarmerShellProps = {
  brand: string;
  farmName?: string;
  userLabel?: string;
  languageLabel: string;
  labels: FarmerShellLabels;
  moreItems: FarmerShellMoreItem[];
  farmsHref?: string;
  homeHref?: string;
  planHref?: string;
  assistantHref?: string;
  children?: ReactNode;
  onToggleLanguage: () => void;
  className?: string;
};

function tabClass({ isActive }: { isActive: boolean }) {
  return cn(
    'relative flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.65rem] font-semibold no-underline transition-colors duration-150',
    isActive ? 'text-primary-700' : 'text-muted hover:text-primary-600',
  );
}

function TabIcon({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
        active ? 'bg-primary-100 text-primary-700' : 'text-current',
      )}
    >
      {children}
    </span>
  );
}

export function FarmerShell({
  brand,
  farmName,
  userLabel,
  languageLabel,
  labels,
  moreItems,
  farmsHref = '/',
  homeHref,
  planHref,
  assistantHref,
  children,
  onToggleLanguage,
  className,
}: FarmerShellProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const farmReady = Boolean(homeHref && planHref && assistantHref);

  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-primary-foreground shadow-sm">
              <Leaf className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <NavLink
                to={farmsHref}
                className="block truncate font-display text-lg font-bold tracking-tight text-primary-800 no-underline"
              >
                {brand}
              </NavLink>
              {farmName ? (
                <p className="m-0 truncate text-xs font-medium text-muted">{farmName}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
              onClick={onToggleLanguage}
            >
              {languageLabel}
            </button>
            <Avatar name={userLabel} />
          </div>
        </div>
      </header>

      <main className="hv-rise mx-auto w-full max-w-xl flex-1 px-4 pb-28 pt-6">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 px-3 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-xl overflow-hidden rounded-2xl border border-border bg-white/95 shadow-nav backdrop-blur-md">
          <NavLink to={farmsHref} end className={tabClass}>
            {({ isActive }) => (
              <>
                <TabIcon active={isActive}>
                  <Sprout className="h-5 w-5" aria-hidden />
                </TabIcon>
                {labels.farms}
              </>
            )}
          </NavLink>
          {farmReady ? (
            <NavLink to={homeHref!} end className={tabClass}>
              {({ isActive }) => (
                <>
                  <TabIcon active={isActive}>
                    <House className="h-5 w-5" aria-hidden />
                  </TabIcon>
                  {labels.home}
                </>
              )}
            </NavLink>
          ) : (
            <span className={cn(tabClass({ isActive: false }), 'opacity-40')} aria-disabled>
              <TabIcon>
                <House className="h-5 w-5" aria-hidden />
              </TabIcon>
              {labels.home}
            </span>
          )}
          {farmReady ? (
            <NavLink to={planHref!} className={tabClass}>
              {({ isActive }) => (
                <>
                  <TabIcon active={isActive}>
                    <ClipboardList className="h-5 w-5" aria-hidden />
                  </TabIcon>
                  {labels.plan}
                </>
              )}
            </NavLink>
          ) : (
            <span className={cn(tabClass({ isActive: false }), 'opacity-40')} aria-disabled>
              <TabIcon>
                <ClipboardList className="h-5 w-5" aria-hidden />
              </TabIcon>
              {labels.plan}
            </span>
          )}
          {farmReady ? (
            <NavLink to={assistantHref!} className={tabClass}>
              {({ isActive }) => (
                <>
                  <TabIcon active={isActive}>
                    <Bot className="h-5 w-5" aria-hidden />
                  </TabIcon>
                  {labels.assistant}
                </>
              )}
            </NavLink>
          ) : (
            <span className={cn(tabClass({ isActive: false }), 'opacity-40')} aria-disabled>
              <TabIcon>
                <Bot className="h-5 w-5" aria-hidden />
              </TabIcon>
              {labels.assistant}
            </span>
          )}
          <button
            type="button"
            aria-label={labels.more}
            className={cn(tabClass({ isActive: moreOpen }), 'border-0 bg-transparent')}
            onClick={() => setMoreOpen(true)}
          >
            <TabIcon active={moreOpen}>
              <Menu className="h-5 w-5" aria-hidden />
            </TabIcon>
            {labels.more}
          </button>
        </div>
      </nav>

      <Drawer open={moreOpen} title={labels.moreTitle} onClose={() => setMoreOpen(false)} side="end">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {moreItems.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <NavLink
                  to={item.href}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-foreground no-underline transition hover:bg-primary-50"
                  onClick={() => setMoreOpen(false)}
                >
                  {item.label}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="w-full rounded-xl px-3 py-3 text-start text-sm font-medium transition hover:bg-primary-50"
                  onClick={() => {
                    setMoreOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
}
