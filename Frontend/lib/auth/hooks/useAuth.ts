"use client"

import { signIn, signOut } from "next-auth/react"
import { useSession } from "./useSession"

export function useAuth() {
  const session = useSession()

  const login = async (provider: string = "google", callbackUrl?: string) => {
    try {
      await signIn(provider, { callbackUrl: callbackUrl || "/" })
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = async (callbackUrl?: string) => {
    try {
      await signOut({ callbackUrl: callbackUrl || "/login" })
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  return {
    ...session,
    login,
    logout,
  }
}
