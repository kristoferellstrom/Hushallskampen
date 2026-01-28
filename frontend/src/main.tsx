import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.scss";
import "./styles/app.scss";
import "./pwa";
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
