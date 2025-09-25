import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  build: {
    outDir: '.',
    emptyOutDir: false,
  },
  plugins: [
    react(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'https://forum.warthunder.com',
        author: 'themadseventeen',
        description: 'Small improvements to the War Thunder forums',
        match: ['https://forum.warthunder.com/*'],
        name: 'Better Forums',
        connect: 'themadseventeen.github.io',
        version: '1.3.1'
      },
      build: {
        fileName: 'script.js',
      },
    }),
  ],
});
