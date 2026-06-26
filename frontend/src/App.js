import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserDataProvider } from "./context/UserDataContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import { CandidatesPage, CandidateProfile, RecommendationsPage, AnalyticsPage } from "./pages/pages.jsx";
import Sidebar from "./components/Sidebar";
import "./App.css";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loading">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
      <Route path="/dashboard" element={
        <RequireAuth><UserDataProvider><AppLayout><Dashboard /></AppLayout></UserDataProvider></RequireAuth>
      } />
      <Route path="/upload" element={
        <RequireAuth><UserDataProvider><AppLayout><UploadPage /></AppLayout></UserDataProvider></RequireAuth>
      } />
      <Route path="/candidates" element={
        <RequireAuth><UserDataProvider><AppLayout><CandidatesPage /></AppLayout></UserDataProvider></RequireAuth>
      } />
      <Route path="/candidate/:id" element={
        <RequireAuth><UserDataProvider><AppLayout><CandidateProfile /></AppLayout></UserDataProvider></RequireAuth>
      } />
      <Route path="/recommendations" element={
        <RequireAuth><UserDataProvider><AppLayout><RecommendationsPage /></AppLayout></UserDataProvider></RequireAuth>
      } />
      <Route path="/analytics" element={
        <RequireAuth><UserDataProvider><AppLayout><AnalyticsPage /></AppLayout></UserDataProvider></RequireAuth>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
