import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Free-tier backends sleep when idle. Ping them as soon as the page opens so
// they are awake by the time the user logs in. Errors are ignored on purpose.
[
  import.meta.env.VITE_AUTH_BASE_URL,
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_AI_BASE_URL,
]
  .filter(Boolean)
  .forEach((url) => fetch(url, { mode: "no-cors" }).catch(() => {}));

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
