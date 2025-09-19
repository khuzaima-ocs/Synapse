"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isReady } = useAuth()

  const isAuthRoute = pathname === "/login" || pathname === "/signup"

  useEffect(() => {
    if (!isReady) return
    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/login")
      return
    }
    if (isAuthenticated && isAuthRoute) {
      router.replace("/")
    }
  }, [isReady, isAuthenticated, isAuthRoute, router])

  if (!isReady) return null
  if (!isAuthenticated && !isAuthRoute) return null
  if (isAuthenticated && isAuthRoute) return null

  return <>{children}</>
}


