import { createSSRApp } from 'vue'
import calculatorVue from './pages/calculator/calculator.vue'
import App from './App.vue'
import { createPinia } from 'pinia'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.component('calculator', calculatorVue)
  return {
    app,
  }
}
