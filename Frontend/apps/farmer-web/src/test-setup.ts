import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import '@hv/ui/globals.css';

vi.stubEnv('VITE_USE_FIXTURES', 'true');
