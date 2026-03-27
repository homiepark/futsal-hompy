import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler for debugging
window.addEventListener('error', (event) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:monospace;color:red;font-size:12px;">
      <h2>Error:</h2>
      <pre>${event.message}\n${event.filename}:${event.lineno}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (e: any) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:monospace;color:red;font-size:12px;">
      <h2>Render Error:</h2>
      <pre>${e?.message || e}</pre>
    </div>`;
  }
}
