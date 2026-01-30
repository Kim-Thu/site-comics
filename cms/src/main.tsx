import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './presentation/styles/globals.css'
import { useSettingsStore } from './store/settings.store'

// Initialize theme immediately from localStorage
const savedColor = localStorage.getItem('accent-color');
if (savedColor) {
    useSettingsStore.getState().applyTheme(savedColor);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#18181b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>,
)
