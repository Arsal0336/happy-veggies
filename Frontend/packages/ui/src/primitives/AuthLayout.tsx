import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '../utils/cn';

export type AuthLayoutProps = {
  title: string;
  lead?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AuthLayout({ title, lead, hint, children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]',
        className,
      )}
    >
      <aside className="relative hidden overflow-hidden bg-primary-800 px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 20% 20%, var(--hv-color-primary-400), transparent 50%), radial-gradient(ellipse at 80% 80%, var(--hv-color-primary-600), transparent 45%)',
          }}
        />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-200" aria-hidden>
            Happy Veggie
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight">
            Digital twin for Pakistani farms
          </h2>
          <p className="mt-3 max-w-md text-sm text-primary-100">
            Plans, weather, soil, and assistant guidance grounded in your farm — not generic advice.
          </p>
        </div>
        <p className="relative text-xs text-primary-200">Bano Qabil × Alibaba Cloud AI Hackathon</p>
      </aside>

      <div className="flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--hv-color-primary-50),transparent_55%)] px-4 py-10">
        <Card className="w-full max-w-md" padding="lg">
          <p className="mb-1 text-sm font-semibold text-primary-600 lg:hidden" aria-hidden>
            Happy Veggie
          </p>
          <h1 className="m-0 text-2xl font-bold">{title}</h1>
          {lead ? <p className="mt-2 text-sm text-muted">{lead}</p> : null}
          <div className="mt-6">{children}</div>
          {hint ? <div className="mt-4 text-xs text-muted">{hint}</div> : null}
        </Card>
      </div>
    </div>
  );
}
