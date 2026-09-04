import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, ClipboardList, House, Menu, Sprout } from 'lucide-react';
import { cn } from '../utils/cn';
import { Drawer } from '../primitives/Drawer';
import { Avatar } from './Avatar';
import { IconButton } from './IconButton';

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
    'flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-medium no-underline',
    isActive ? 'text-primary-700' : 'text-muted',
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
    <div className={cn('flex min-h-screen flex-col bg-background', className)}>
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <NavLink to={farmsHref} className="text-lg font-bold text-primary-700 no-underline">
              {brand}
            </NavLink>
            {farmName ? <p className="m-0 truncate text-xs text-muted">{farmName}</p> : null}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50"
              onClick={onToggleLanguage}
            >
              {languageLabel}
            </button>
            <Avatar name={userLabel} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-4">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-xl">
          <NavLink to={farmsHref} end className={tabClass}>
            <Sprout className="h-5 w-5" aria-hidden />
            {labels.farms}
          </NavLink>
          {farmReady ? (
            <NavLink to={homeHref!} end className={tabClass}>
              <House className="h-5 w-5" aria-hidden />
              {labels.home}
            </NavLink>
          ) : (
            <span className={tabClass({ isActive: false })} aria-disabled>
              <House className="h-5 w-5" aria-hidden />
              {labels.home}
            </span>
          )}
          {farmReady ? (
            <NavLink to={planHref!} className={tabClass}>
              <ClipboardList className="h-5 w-5" aria-hidden />
              {labels.plan}
            </NavLink>
          ) : (
            <span className={tabClass({ isActive: false })} aria-disabled>
              <ClipboardList className="h-5 w-5" aria-hidden />
              {labels.plan}
            </span>
          )}
          {farmReady ? (
            <NavLink to={assistantHref!} className={tabClass}>
              <Bot className="h-5 w-5" aria-hidden />
              {labels.assistant}
            </NavLink>
          ) : (
            <span className={tabClass({ isActive: false })} aria-disabled>
              <Bot className="h-5 w-5" aria-hidden />
              {labels.assistant}
            </span>
          )}
          <IconButton
            label={labels.more}
            className="h-auto min-h-[3.25rem] w-auto flex-1 flex-col gap-0.5 rounded-none text-[0.65rem] font-medium text-muted"
            onClick={() => setMoreOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
            {labels.more}
          </IconButton>
        </div>
      </nav>

      <Drawer open={moreOpen} title={labels.moreTitle} onClose={() => setMoreOpen(false)} side="end">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {moreItems.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <NavLink
                  to={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-foreground no-underline hover:bg-primary-50"
                  onClick={() => setMoreOpen(false)}
                >
                  {item.label}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2.5 text-start text-sm hover:bg-primary-50"
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
