import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Lets the app be installed on a phone's home screen and open on a weak signal.
if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
}
// Android shows "Install app" when the page asks; keep the offer for the Account page.
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); window.__installPrompt = e; });
