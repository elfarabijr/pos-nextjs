"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"

interface UseIdleTimerOptions {
  timeout: number // in milliseconds
  onIdle?: () => void
  onActive?: () => void
  onWarning?: (timeLeft: number) => void
  warningTime?: number // time before timeout to show warning (in milliseconds)
  events?: string[]
  enabled?: boolean
}

export function useIdleTimer({
  timeout = 15 * 60 * 1000, // 15 minutes default
  onIdle,
  onActive,
  onWarning,
  warningTime = 2 * 60 * 1000, // 2 minutes warning default
  events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click", "keydown"],
  enabled = true,
}: UseIdleTimerOptions) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningTimeoutRef = useRef<NodeJS.Timeout>()
  const lastActiveRef = useRef<number>(Date.now())
  const isIdleRef = useRef<boolean>(false)

  const [configuredTimeout, setConfiguredTimeout] = useState(timeout)
  const [configuredWarningTime, setConfiguredWarningTime] = useState(warningTime)

  useEffect(() => {
    const savedSettings = localStorage.getItem("securitySettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setConfiguredTimeout(settings.sessionTimeout * 60 * 1000) // Convert minutes to milliseconds
      setConfiguredWarningTime(settings.warningTime * 60 * 1000)
    }
  }, [])

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
  }, [])

  const handleIdle = useCallback(() => {
    if (!enabled) return

    isIdleRef.current = true
    clearTimeouts()

    // Clear authentication and redirect to login
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.setItem("sessionExpired", "true")

    if (onIdle) {
      onIdle()
    }

    router.push("/login")
  }, [enabled, onIdle, router, clearTimeouts])

  const handleWarning = useCallback(() => {
    if (!enabled || isIdleRef.current) return

    const timeLeft = Math.ceil((timeout - (Date.now() - lastActiveRef.current)) / 1000)
    if (onWarning) {
      onWarning(timeLeft)
    }
  }, [enabled, timeout, onWarning])

  const resetTimer = useCallback(() => {
    if (!enabled) return

    const wasIdle = isIdleRef.current
    isIdleRef.current = false
    lastActiveRef.current = Date.now()

    clearTimeouts()

    // Set warning timeout
    if (configuredWarningTime > 0) {
      warningTimeoutRef.current = setTimeout(handleWarning, configuredTimeout - configuredWarningTime)
    }

    // Set idle timeout
    timeoutRef.current = setTimeout(handleIdle, configuredTimeout)

    if (wasIdle && onActive) {
      onActive()
    }
  }, [enabled, configuredTimeout, configuredWarningTime, handleIdle, handleWarning, onActive, clearTimeouts])

  useEffect(() => {
    if (!enabled) {
      clearTimeouts()
      return
    }

    // Initialize timer
    resetTimer()

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true)
    })

    // Cleanup
    return () => {
      clearTimeouts()
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [enabled, events, resetTimer, clearTimeouts, configuredTimeout, configuredWarningTime])

  const getRemainingTime = useCallback(() => {
    if (!enabled || isIdleRef.current) return 0
    return Math.max(0, timeout - (Date.now() - lastActiveRef.current))
  }, [enabled, timeout])

  const getLastActiveTime = useCallback(() => {
    return lastActiveRef.current
  }, [])

  const isIdle = useCallback(() => {
    return isIdleRef.current
  }, [])

  return {
    getRemainingTime,
    getLastActiveTime,
    isIdle,
    resetTimer,
  }
}
