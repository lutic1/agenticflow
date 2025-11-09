import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Mock Service Worker for browser environment (development)
 * This allows you to test API integrations in the browser without a real backend
 *
 * To enable MSW in development:
 * 1. Run: npx msw init public/ --save
 * 2. Add to app/layout.tsx:
 *    if (process.env.NODE_ENV === 'development') {
 *      const { worker } = await import('@/mocks/browser');
 *      worker.start();
 *    }
 */
export const worker = setupWorker(...handlers);
