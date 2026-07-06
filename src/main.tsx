import { createRoot } from "react-dom/client";
import App from "./App";
import { useAppStore } from "./store/useAppStore";
import "./styles/wii.css";

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__appStore = useAppStore;
}

createRoot(document.getElementById("root")!).render(<App />);
