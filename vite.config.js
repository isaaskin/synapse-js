import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'synapse',
      fileName: (format, _) => `synapse.${format}.js`
    },
  },
  plugins: [dts()]
})
