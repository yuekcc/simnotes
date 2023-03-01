import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  base: isDev ? '/' : '/web/',
  plugins: [vue()],
});
