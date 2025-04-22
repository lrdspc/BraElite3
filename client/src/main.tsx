import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// --- Sentry para monitoramento de erros ---
// Instale antes: npm install --save @sentry/react @sentry/tracing
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "COLOQUE_SUA_DSN_AQUI",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// --- Web Vitals para monitoramento de performance ---
// Instale antes: npm install --save web-vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Exemplo: envie para Sentry
  Sentry.captureMessage(JSON.stringify(metric));
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);

createRoot(document.getElementById("root")!).render(<App />);
