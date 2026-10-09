import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { GlobalProvider } from "@/app/providers/GlobalProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalProvider />
  </StrictMode>,
);
