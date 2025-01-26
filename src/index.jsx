import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log("Initializing app");
const root = createRoot(document.getElementById('root'));
console.log("Root element found:", document.getElementById('root'));
root.render(<App />);
console.log("App rendered");
