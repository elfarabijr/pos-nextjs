"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useOfflineMode } from "@/hooks/useOfflineMode"

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingChanges, lastSyncTime, forcSync } = useOfflineMode()

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never"

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    return date.toLocaleDateString()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}

          <Badge
            variant={isOnline ? "default" : "destructive"}
            className={`text-xs ${
              isOnline ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>

          {pendingChanges > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {pendingChanges}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Connection Status</h4>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isOnline ? "text-green-600" : "text-red-600"}`}>
                {isOnline ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sync Status:</span>
              <div className="flex items-center gap-1">
                {isSyncing && <RefreshCw className="h-3 w-3 animate-spin" />}
                <span className={isSyncing ? "text-blue-600" : "text-gray-800"}>
                  {isSyncing ? "Syncing..." : "Up to date"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Changes:</span>
              <Badge variant={pendingChanges > 0 ? "destructive" : "secondary"} className="text-xs">
                {pendingChanges}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Sync:</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-gray-800">{formatLastSync(lastSyncTime)}</span>
              </div>
            </div>
          </div>

          {isOnline && (
            <Button onClick={forcSync} disabled={isSyncing} size="sm" className="w-full">
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          )}

          {!isOnline && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium">Working Offline</p>
                  <p>Changes will sync when connection is restored.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
