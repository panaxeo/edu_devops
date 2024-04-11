import { fileURLToPath, URL } from 'node:url'
import { defineConfig, UserConfig, UserConfigFnObject } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig(({ mode }) => {
  // all envs
  const config: UserConfig = {
    base: './',
    plugins: [
      vue(),
      vueJsx(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };

  if (mode === 'development') {
    config.server = {
      proxy: {
        '/backend': {
          target: 'http://localhost:8080',
          rewrite: (path) => path.replace(/^\/backend/, '')
        }
      }
    }
  } else if (mode === 'dev-k8s') {
    config.server = {
      proxy: {
        '/backend': {
          target: 'http://cluster.dev.local',
          changeOrigin: true
        }
      }
    }
  }

  return config;
})