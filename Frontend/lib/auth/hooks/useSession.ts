"use client"

import { useSession as useNextAuthSession } from "next-auth/react"

export function useSession() {
  const session = useNextAuthSession()

  return {
    user: session.data?.user,
    status: session.status,
    isLoading: session.status === "loading",
    isAuthenticated: session.status === "authenticated",
    isUnauthenticated: session.status === "unauthenticated",
  }
}
