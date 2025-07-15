"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Camera,
  CameraOff,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { validateBarcode, type BarcodeResult } from "@/utils/barcodeUtils"

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: BarcodeResult) => void
  title?: string
}

export function BarcodeScanner({ isOpen, onClose, onScan, title = "Barcode Scanner" }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()

  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<BarcodeResult | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsScanning(false)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setCameras(videoDevices)

      if (videoDevices.length === 0) {
        throw new Error("No cameras found")
      }

      // Use back camera if available, otherwise use first camera
      const preferredCamera =
        videoDevices.find(
          (device) => device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear"),
        ) ||
        videoDevices[currentCameraIndex] ||
        videoDevices[0]

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: preferredCamera.deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
        setHasPermission(true)

        // Start scanning after video loads
        videoRef.current.onloadedmetadata = () => {
          startScanning()
        }
      }
    } catch (err) {
      console.error("Camera error:", err)
      setHasPermission(false)
      setError(err instanceof Error ? err.message : "Failed to access camera")
    }
  }, [currentCameraIndex])

  const switchCamera = useCallback(() => {
    if (cameras.length > 1) {
      stopCamera()
      setCurrentCameraIndex((prev) => (prev + 1) % cameras.length)
    }
  }, [cameras.length, stopCamera])

  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      if (track && "torch" in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any],
          })
          setFlashEnabled(!flashEnabled)
        } catch (err) {
          console.error("Flash toggle error:", err)
        }
      }
    }
  }, [flashEnabled])

  const startScanning = useCallback(() => {
    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(scanFrame)
        return
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Simulate barcode detection (in a real implementation, you'd use a library like ZXing)
      // For demo purposes, we'll simulate finding a barcode in the center area
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const scanArea = {
        x: centerX - 100,
        y: centerY - 50,
        width: 200,
        height: 100,
      }

      // Draw scan area overlay
      ctx.strokeStyle = "#00ff00"
      ctx.lineWidth = 2
      ctx.strokeRect(scanArea.x, scanArea.y, scanArea.width, scanArea.height)

      // Simulate barcode detection with a random chance
      if (Math.random() < 0.01) {
        // 1% chance per frame
        const mockBarcodes = ["1234567890123", "9876543210987", "4567890123456", "7890123456789"]
        const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
        const result = validateBarcode(randomBarcode)

        if (result.isValid) {
          setLastScanResult(result)
          onScan(result)
          return // Stop scanning after successful scan
        }
      }

      animationRef.current = requestAnimationFrame(scanFrame)
    }

    scanFrame()
  }, [isScanning, onScan])

  useEffect(() => {
    if (isOpen && hasPermission === null) {
      // Check camera permission
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => setHasPermission(true))
        .catch(() => setHasPermission(false))
    }
  }, [isOpen, hasPermission])

  useEffect(() => {
    if (isOpen && hasPermission) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, hasPermission, startCamera, stopCamera])

  useEffect(() => {
    if (currentCameraIndex > 0 && cameras.length > 0) {
      startCamera()
    }
  }, [currentCameraIndex, cameras.length, startCamera])

  const handleClose = () => {
    stopCamera()
    setLastScanResult(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasPermission === false && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera permission is required to scan barcodes. Please allow camera access and try again.
              </AlertDescription>
            </Alert>
          )}

          {lastScanResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully scanned: {lastScanResult.code} ({lastScanResult.format})
              </AlertDescription>
            </Alert>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {hasPermission && (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-500 bg-green-500/10 rounded-lg p-4">
                    <div className="w-48 h-24 border-2 border-dashed border-green-400 rounded flex items-center justify-center">
                      {isScanning ? (
                        <div className="text-green-400 text-sm font-medium animate-pulse">Scanning...</div>
                      ) : (
                        <Loader2 className="h-6 w-6 text-green-400 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Camera controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {cameras.length > 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={switchCamera}
                      className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFlash}
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  >
                    {flashEnabled ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <Badge variant={isScanning ? "default" : "secondary"}>
                    {isScanning ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                        Scanning
                      </>
                    ) : (
                      <>
                        <CameraOff className="w-3 h-3 mr-1" />
                        Stopped
                      </>
                    )}
                  </Badge>
                </div>
              </>
            )}

            {!hasPermission && (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <CameraOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Camera Access Required</p>
                  <p className="text-sm opacity-75">Please allow camera permission to scan barcodes</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Position the barcode within the scanning area</p>
            <p>The scanner will automatically detect and validate barcodes</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
