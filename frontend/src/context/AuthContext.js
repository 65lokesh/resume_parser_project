/**
 * context/AuthContext.js
 *
 * Global auth state. Stores the logged-in user in localStorage so
 * sessions survive page refreshes. Per-user data is keyed by userId
 * so multiple accounts on the same browser stay isolated.
 *
 * In production: swap localStorage for JWT / Django session auth.
 */

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// ── Tiny user "database" stored in localStorage ───────────────────────────────
const USERS_KEY = "resumeai_users";
const SESSION_KEY = "resumeai_session";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
  catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setUser(JSON.parse(saved)); }
      catch { localStorage.removeItem(SESSION_KEY); }
    }
    setLoading(false);
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────────
  const register = ({ name, email, password }) => {
    const users = getUsers();
    if (users[email]) throw new Error("An account with this email already exists.");
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // plaintext for demo — use bcrypt in production
      createdAt: new Date().toISOString(),
    };
    users[email] = newUser;
    saveUsers(users);
    _startSession(newUser);
  };

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = ({ email, password }) => {
    const users = getUsers();
    const found = users[email];
    if (!found || found.password !== password)
      throw new Error("Email or password is incorrect.");
    _startSession(found);
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const _startSession = (u) => {
    const { password: _, ...safe } = u;   // never expose password outside
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    setUser(safe);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
