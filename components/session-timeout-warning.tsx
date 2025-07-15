"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Clock, RefreshCw } from "lucide-react"

interface SessionTimeoutWarningProps {
  isOpen: boolean
  timeLeft: number
  onExtendSession: () => void
  onLogout: () => void
}

export function SessionTimeoutWarning({ isOpen, timeLeft, onExtendSession, onLogout }: SessionTimeoutWarningProps) {
  const [countdown, setCountdown] = useState(timeLeft)

  useEffect(() => {
    setCountdown(timeLeft)
  }, [timeLeft])

  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, onLogout])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressValue = (countdown / timeLeft) * 100

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white border-warning-200 shadow-tech-lg" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning-700">
            <AlertTriangle className="h-5 w-5" />
            Session Timeout Warning
          </DialogTitle>
        </DialogHeader>

        <Card className="border-warning-200 bg-warning-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-8 w-8 text-warning-600" />
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-700">{formatTime(countdown)}</div>
                <div className="text-sm text-warning-600">Time remaining</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-warning-700">
                <span>Session expires in:</span>
                <span>{formatTime(countdown)}</span>
              </div>
              <Progress
                value={progressValue}
                className="h-2 bg-warning-200"
                style={
                  {
                    "--progress-background": "rgb(251 191 36)", // warning-400
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="text-center text-sm text-warning-700 bg-warning-100 p-3 rounded-lg">
              <p className="font-medium mb-1">Your session will expire due to inactivity</p>
              <p>You will be automatically logged out for security reasons.</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={onExtendSession} className="flex-1 tech-button text-white font-semibold">
                <RefreshCw className="mr-2 h-4 w-4" />
                Stay Logged In
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex-1 border-warning-300 text-warning-700 hover:bg-warning-50 bg-transparent"
              >
                Logout Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
