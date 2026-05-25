import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register Service Worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Có phiên bản mới của game! Tải lại trang ngay để cập nhật?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Game đã sẵn sàng để chơi offline!')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
