import { assetUrl } from "../assetUrl";

/** Online/offline + service worker registration. */
export function attachRuntimeHooks(onConnectivity: () => void): void {
  window.addEventListener("online", onConnectivity);
  window.addEventListener("offline", onConnectivity);
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(assetUrl("sw.js")).catch(() => {});
    });
  }
}
