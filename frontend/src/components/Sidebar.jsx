import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/upload", icon: "📤", label: "Upload Resume" },
  { to: "/candidates", icon: "👥", label: "Candidates" },
  { to: "/recommendations", icon: "💼", label: "Job Matches" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Brand */}
      <div className="sb-brand">
        <span className="sb-logo">⚡</span>
        {!collapsed && <span className="sb-name">ResumeAI</span>}
        <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* User badge */}
      {!collapsed && user && (
        <div className="sb-user">
          <div className="sb-avatar">{user.name?.[0]?.toUpperCase() ?? "U"}</div>
          <div className="sb-user-info">
            <p className="sb-user-name">{user.name}</p>
            <p className="sb-user-email">{user.email}</p>
          </div>
        </div>
      )}
      {collapsed && user && (
        <div className="sb-avatar sb-avatar--center">{user.name?.[0]?.toUpperCase() ?? "U"}</div>
      )}

      {/* Nav links */}
      <nav className="sb-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sb-link ${isActive ? "sb-link--active" : ""}`}
          >
            <span className="sb-icon">{icon}</span>
            {!collapsed && <span className="sb-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sb-logout" onClick={handleLogout}>
        <span className="sb-icon">🚪</span>
        {!collapsed && <span>Sign out</span>}
      </button>
    </aside>
  );
}
