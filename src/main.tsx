import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

import { applyLocale, applyWorkspaceAppearance } from "./lib/preferences";

applyLocale();
applyWorkspaceAppearance();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        },
      }}
    />
  </StrictMode>
);
