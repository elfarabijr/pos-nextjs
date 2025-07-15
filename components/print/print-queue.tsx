"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle, XCircle, RefreshCw, Printer, AlertTriangle } from "lucide-react"
import { printerService, type PrintJob } from "@/utils/printerUtils"

interface PrintQueueProps {
  className?: string
}

export function PrintQueue({ className }: PrintQueueProps) {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadPrintJobs()

    // Set up event listeners for real-time updates
    const handleJobUpdate = () => {
      loadPrintJobs()
    }

    printerService.on("printJobCreated", handleJobUpdate)
    printerService.on("printJobCompleted", handleJobUpdate)
    printerService.on("printJobFailed", handleJobUpdate)
    printerService.on("printJobRetry", handleJobUpdate)

    return () => {
      printerService.off("printJobCreated", handleJobUpdate)
      printerService.off("printJobCompleted", handleJobUpdate)
      printerService.off("printJobFailed", handleJobUpdate)
      printerService.off("printJobRetry", handleJobUpdate)
    }
  }, [])

  const loadPrintJobs = () => {
    const jobs = printerService.getPrintJobs()
    // Sort by creation date, newest first
    const sortedJobs = jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    setPrintJobs(sortedJobs.slice(0, 20)) // Show last 20 jobs
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for UX
    loadPrintJobs()
    setIsRefreshing(false)
  }

  const handleRetryJob = async (jobId: string) => {
    try {
      await printerService.retryPrintJob(jobId)
    } catch (error) {
      console.error("Failed to retry job:", error)
    }
  }

  const getJobStatusIcon = (status: PrintJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive-500" />
      case "printing":
        return <Printer className="h-4 w-4 text-primary-500 animate-pulse" />
      case "pending":
        return <Clock className="h-4 w-4 text-warning-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-secondary-400" />
    }
  }

  const getJobStatusBadge = (status: PrintJob["status"]) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      printing: "secondary",
      pending: "secondary",
    } as const

    return (
      <Badge
        variant={variants[status]}
        className={
          status === "completed"
            ? "bg-success-500 text-white"
            : status === "printing"
              ? "bg-primary-500 text-white"
              : status === "pending"
                ? "bg-warning-500 text-white"
                : ""
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatJobId = (jobId: string) => {
    return jobId.split("-")[1]?.substring(0, 6) || jobId.substring(0, 6)
  }

  const getJobDuration = (job: PrintJob) => {
    if (job.completedAt) {
      const duration = job.completedAt.getTime() - job.createdAt.getTime()
      return `${Math.round(duration / 1000)}s`
    }
    return "-"
  }

  const pendingJobs = printJobs.filter((job) => job.status === "pending" || job.status === "printing")
  const completedJobs = printJobs.filter((job) => job.status === "completed")
  const failedJobs = printJobs.filter((job) => job.status === "failed")

  return (
    <Card className={`tech-card ${className}`}>
      <CardHeader className="border-b border-primary-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-secondary-800">
            <Printer className="h-5 w-5 text-primary-600" />
            Print Queue
          </CardTitle>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {printJobs.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            <Printer className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
            <p>No print jobs</p>
            <p className="text-sm">Print jobs will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Queue Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-warning-50 rounded-lg border border-warning-200">
                <div className="text-2xl font-bold text-warning-700">{pendingJobs.length}</div>
                <div className="text-xs text-warning-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-success-50 rounded-lg border border-success-200">
                <div className="text-2xl font-bold text-success-700">{completedJobs.length}</div>
                <div className="text-xs text-success-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-destructive-50 rounded-lg border border-destructive-200">
                <div className="text-2xl font-bold text-destructive-700">{failedJobs.length}</div>
                <div className="text-xs text-destructive-600">Failed</div>
              </div>
            </div>

            {/* Job List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {printJobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    job.status === "printing"
                      ? "border-primary-300 bg-primary-50"
                      : job.status === "failed"
                        ? "border-destructive-200 bg-destructive-50"
                        : job.status === "completed"
                          ? "border-success-200 bg-success-50"
                          : "border-primary-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getJobStatusIcon(job.status)}
                      <div>
                        <p className="text-sm font-medium text-secondary-800">Job #{formatJobId(job.id)}</p>
                        <div className="flex items-center gap-2 text-xs text-secondary-500">
                          <span>{job.createdAt.toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>Duration: {getJobDuration(job)}</span>
                          {job.retryCount > 0 && (
                            <>
                              <span>•</span>
                              <span>Retries: {job.retryCount}</span>
                            </>
                          )}
                        </div>
                        {job.error && <p className="text-xs text-destructive-600 mt-1">{job.error}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getJobStatusBadge(job.status)}
                      {job.status === "failed" && job.retryCount < 3 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryJob(job.id)}
                          className="text-xs border-primary-200 text-primary-700 hover:bg-primary-50"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>

                  {job.status === "printing" && (
                    <div className="mt-2">
                      <Progress value={75} className="w-full h-2" />
                      <div className="text-xs text-secondary-500 mt-1 text-center">Printing...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Summary */}
            {failedJobs.length > 0 && (
              <Alert className="border-destructive-200 bg-destructive-50">
                <AlertTriangle className="h-4 w-4 text-destructive-600" />
                <AlertDescription className="text-destructive-800">
                  {failedJobs.length} print job{failedJobs.length > 1 ? "s" : ""} failed. Check printer connection and
                  paper supply.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
