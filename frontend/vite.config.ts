import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/** @type {import('vite').UserConfig} */
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react(), tsconfigPaths(), nodePolyfills(),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
})
