import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler for debugging
window.onerror = (message, source, lineno, colno, error) => {
  const root = document.getElementById("root");
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:20px;font-family:monospace;color:red;font-size:12px;word-break:break-all;">
      <h2>JS Error:</h2>
      <p>${message}</p>
      <p>Source: ${source}:${lineno}:${colno}</p>
      <pre>${error?.stack || 'no stack'}</pre>
    </div>`;
  }
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootEl = document.getElementById("root");
if (rootEl) {
  try {
    createRoot(rootEl).render(<App />);
  } catch (e: any) {
    rootEl.innerHTML = `<div style="padding:20px;font-family:monospace;color:red;font-size:12px;word-break:break-all;">
      <h2>Render Error:</h2>
      <pre>${e?.message || e}\n\n${e?.stack || ''}</pre>
    </div>`;
  }
}
