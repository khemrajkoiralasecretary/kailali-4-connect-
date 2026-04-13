import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY   = "k4-citizen-token";
const PROFILE_KEY = "k4-citizen-profile";

export interface CitizenProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  ward: number;
  palika: string;
  createdAt: string;
}

interface CitizenAuthCtx {
  citizen: CitizenProfile | null;
  token: string | null;
  setCitizenSession: (token: string, profile: CitizenProfile) => void;
  clearCitizenSession: () => void;
}

const CitizenAuthContext = createContext<CitizenAuthCtx>({
  citizen: null,
  token: null,
  setCitizenSession: () => {},
  clearCitizenSession: () => {},
});

export function CitizenAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [citizen, setCitizen] = useState<CitizenProfile | null>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
    return () => setAuthTokenGetter(null);
  }, []);

  const setCitizenSession = (tok: string, profile: CitizenProfile) => {
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setToken(tok);
    setCitizen(profile);
  };

  const clearCitizenSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setCitizen(null);
  };

  return (
    <CitizenAuthContext.Provider value={{ citizen, token, setCitizenSession, clearCitizenSession }}>
      {children}
    </CitizenAuthContext.Provider>
  );
}

export function useCitizenAuth() {
  return useContext(CitizenAuthContext);
}
