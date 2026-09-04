import type { ReactNode } from 'react';
import { Leaf } from 'lucide-react';
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
        'grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,30rem)]',
        className,
      )}
    >
      <aside className="relative hidden overflow-hidden bg-primary-900 px-12 py-14 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 15% 20%, rgb(61 158 88 / 0.45), transparent 50%), radial-gradient(ellipse at 85% 75%, rgb(45 184 138 / 0.25), transparent 45%), linear-gradient(165deg, var(--hv-color-primary-800), var(--hv-color-primary-900))',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-100">
            <Leaf className="h-3.5 w-3.5" aria-hidden />
            AI Farm Digital Twin
          </div>
          <p className="font-display text-4xl font-bold leading-tight tracking-tight" role="heading" aria-level={1}>
            Happy Veggie
          </p>
          <h2 className="mt-5 max-w-md font-display text-2xl font-semibold leading-snug text-primary-50">
            Decisions grounded in your land, weather, and water — not generic advice.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-100">
            Plans, twin insights, and an assistant that knows your farm. Built for Pakistani growers.
          </p>
        </div>
        <p className="relative text-xs font-medium tracking-wide text-primary-200">
          Bano Qabil × Alibaba Cloud AI Hackathon 2026
        </p>
      </aside>

      <div className="relative flex items-center justify-center px-4 py-12">
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'radial-gradient(ellipse at top, var(--hv-color-primary-100), transparent 55%), var(--hv-color-bg)',
          }}
        />
        <Card className="hv-rise relative w-full max-w-md shadow-lg" padding="lg">
          <div className="mb-5 flex items-center gap-2 lg:hidden">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-primary-foreground">
              <Leaf className="h-4 w-4" aria-hidden />
            </span>
            <p className="m-0 font-display text-base font-bold text-primary-800" role="heading" aria-level={1}>
              Happy Veggie
            </p>
          </div>
          <h1 className="m-0 font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {lead ? <p className="mt-2 text-sm leading-relaxed text-muted">{lead}</p> : null}
          <div className="mt-6">{children}</div>
          {hint ? (
            <div className="mt-5 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-relaxed text-muted">
              {hint}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
