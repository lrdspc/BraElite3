import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, isOnline, processSyncQueue } from "./lib/pwa";

// Registrar o service worker para funcionalidades de PWA
registerServiceWorker().catch(error => {
  console.error("Falha ao registrar service worker:", error);
});

// Processar fila de sincronização quando o app iniciar
if (isOnline()) {
  processSyncQueue().catch(error => {
    console.error("Falha ao processar fila de sincronização:", error);
  });
}

// Adicionar listener para eventos online/offline
window.addEventListener("online", () => {
  console.log("Dispositivo online. Tentando sincronizar dados...");
  processSyncQueue().catch(error => {
    console.error("Falha ao processar fila de sincronização:", error);
  });
});

// Renderizar a aplicação
createRoot(document.getElementById("root")!).render(<App />);
