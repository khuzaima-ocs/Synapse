"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/lib/types"

type AuthContextType = {
  user: User | null
  token: string | null
  isReady: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, display_image?: string | null) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("synapse_token") : null
    if (saved) setToken(saved)
    setIsReady(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiClient.login({ email, password })
      if (res?.access_token) {
        localStorage.setItem("synapse_token", res.access_token)
        setToken(res.access_token)
        setUser({ id: "me", name: email.split("@")[0], email })
        return true
      }
    } catch {}
    return false
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string, display_image?: string | null) => {
    try {
      await apiClient.register({ name, email, password, display_image })
      return await login(email, password)
    } catch {
      return false
    }
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem("synapse_token")
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token
  const value = useMemo(() => ({ user, token, isReady, isAuthenticated, login, signup, logout }), [user, token, isReady, isAuthenticated, login, signup, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}


