import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "state";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "state/api";

const store = configureStore({
  reducer: {
    global: globalReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
setupListeners(store.dispatch);

// Periodically invalidate all tags to achieve near real-time updates
const REALTIME_INVALIDATION_MS = 10000; // 10s
const invalidateAll = () => {
  const allTags = [
    { type: "User" },
    { type: "Products" },
    { type: "Customers" },
    { type: "Transactions" },
    { type: "Geography" },
    { type: "Sales" },
    { type: "Admins" },
    { type: "Performance" },
    { type: "Dashboard" },
  ];
  allTags.forEach((tag) => store.dispatch(api.util.invalidateTags([tag])));
};
setInterval(invalidateAll, REALTIME_INVALIDATION_MS);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);