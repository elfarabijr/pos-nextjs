"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useIdleTimer } from "@/hooks/useIdleTimer"
import { SessionTimeoutWarning } from "./session-timeout-warning"

interface SessionManagerProps {
  children: React.ReactNode
  idleTimeout?: number // in minutes
  warningTime?: number // in minutes
}

export function SessionManager({
  children,
  idleTimeout = 15, // 15 minutes default
  warningTime = 2, // 2 minutes warning default
}: SessionManagerProps) {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [warningTimeLeft, setWarningTimeLeft] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    setIsAuthenticated(authStatus === "true")
  }, [])

  const handleIdle = () => {
    setShowWarning(false)
    // The useIdleTimer hook already handles logout
  }

  const handleWarning = (timeLeft: number) => {
    setWarningTimeLeft(timeLeft)
    setShowWarning(true)
  }

  const handleExtendSession = () => {
    setShowWarning(false)
    // Reset the timer by triggering activity
    document.dispatchEvent(new Event("mousedown"))
  }

  const handleLogout = () => {
    setShowWarning(false)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.setItem("sessionExpired", "true")
    router.push("/login")
  }

  const { resetTimer } = useIdleTimer({
    timeout: idleTimeout * 60 * 1000, // Convert minutes to milliseconds
    warningTime: warningTime * 60 * 1000, // Convert minutes to milliseconds
    onIdle: handleIdle,
    onWarning: handleWarning,
    enabled: isAuthenticated,
    events: ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click", "keydown", "focus"],
  })

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      setIsAuthenticated(authStatus === "true")
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <>
      {children}
      <SessionTimeoutWarning
        isOpen={showWarning}
        timeLeft={warningTimeLeft}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
      />
    </>
  )
}
