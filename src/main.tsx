import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  if (typeof resource === "string" && resource.startsWith("/api/")) {
    // If it starts with /api/, prepend the base URL
    // Remove the trailing slash from baseUrl if it exists to avoid double slashes
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    resource = cleanBaseUrl + resource;
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
