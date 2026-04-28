import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "@devnomic/marquee/dist/index.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './assets/css/themify-icons/themify-icons.css'
import "./assets/css/icofont/icofont.min.css"
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
