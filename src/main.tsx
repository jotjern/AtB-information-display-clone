import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import { QueryClient, QueryClientProvider } from "react-query";

setTimeout(() => {
	window.location.reload();
}, 1000 * 60 * 60);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App quayId={"NSR:Quay:73975"} />
    </QueryClientProvider>
  </React.StrictMode>,
);
