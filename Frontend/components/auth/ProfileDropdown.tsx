"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, Settings, User } from "lucide-react"
import { useAuth } from "@/lib/auth/hooks/useAuth"

export function ProfileDropdown() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsOpen(false)
    await logout()
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => login("google")}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition"
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(user.name)
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to profile page when implemented
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-sidebar-accent transition"
            >
              <User className="w-4 h-4" />
              Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings page when implemented
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-sidebar-accent transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          <div className="border-t border-border py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
