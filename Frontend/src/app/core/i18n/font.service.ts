import { Injectable, signal } from '@angular/core';

export type UrduFontId = 'noto' | 'mehr' | 'jameel';

const STORAGE_KEY = 'hv.urduFont';

const FONT_STACKS: Record<UrduFontId, string> = {
  noto: "'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif",
  mehr: "'Scheherazade New', 'Noto Nastaliq Urdu', serif",
  jameel: "'Noto Naskh Arabic', 'Noto Nastaliq Urdu', sans-serif",
};

@Injectable({ providedIn: 'root' })
export class FontService {
  private readonly fontSignal = signal<UrduFontId>(this.read());

  readonly font = this.fontSignal.asReadonly();

  init(): void {
    this.apply(this.fontSignal());
  }

  setFont(id: UrduFontId): void {
    this.fontSignal.set(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    this.apply(id);
  }

  private apply(id: UrduFontId): void {
    document.documentElement.style.setProperty('--hv-urdu-font', FONT_STACKS[id]);
  }

  private read(): UrduFontId {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'mehr' || v === 'jameel' || v === 'noto') return v;
    } catch {
      /* ignore */
    }
    return 'noto';
  }
}
