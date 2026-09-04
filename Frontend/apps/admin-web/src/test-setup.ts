import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/** Force fixture mode for all admin-web tests. */
vi.stubEnv('VITE_USE_FIXTURES', 'true');
