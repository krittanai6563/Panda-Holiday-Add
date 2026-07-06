import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 

const app = createApp(App)

app.use(router) 
app.mount('#app')

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
  }
});