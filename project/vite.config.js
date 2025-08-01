import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'crypto'

// Polyfill for Alpine Linux crypto.hash issue
if (!globalThis.crypto?.hash) {
  if (!globalThis.crypto) globalThis.crypto = {}
  globalThis.crypto.hash = (algorithm, data, options) => {
    return createHash(algorithm).update(data).digest(options?.encoding || 'hex')
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
