// import { fileURLToPath, URL } from 'node:url'

// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     },
//   },
// })

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: false, // 🟢 ป้องกันไม่ให้ระบบสร้างไฟล์แผนผังโค้ด (Source Map)
    minify: 'terser', // 🟢 ให้บีบอัดโค้ดให้เล็กและอ่านยากขึ้น
    terserOptions: {
      compress: {
        drop_console: true, // 🟢 ลบ console.log() ทั้งหมดทิ้ง ป้องกันคนมาแอบดูข้อมูล
        drop_debugger: true
      }
    }
  }
})