import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import '@hv/ui/globals.css';

/** Force fixture mode for all admin-web tests. */
vi.stubEnv('VITE_USE_FIXTURES', 'true');
