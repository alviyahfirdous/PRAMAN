import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// Polyfill webcrypto if not present in jsdom
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  // @ts-expect-error webcrypto assignment in jsdom
  globalThis.crypto = webcrypto;
}
