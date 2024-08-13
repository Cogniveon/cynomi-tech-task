import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./index.css";
import FormPage from "./components/FormPage";
import DashboardPage from "./components/DashboardPage";


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      
    <Router>
      <div className="p-5">
        <nav className="mb-5">
          <Link to="/" className="mr-4 text-blue-500">
            Home
          </Link>
          <Link to="/dashboard" className="text-blue-500">
            Dashboard
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
    </QueryClientProvider>
  </React.StrictMode>
);
