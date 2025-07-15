"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, ImageIcon, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, file: File) => void
  onImageRemove?: () => void
  currentImage?: string
  maxSize?: number // in MB
  acceptedFormats?: string[]
  className?: string
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSize = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file format. Accepted formats: ${acceptedFormats.map((f) => f.split("/")[1]).join(", ")}`
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size: ${maxSize}MB`
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real application, you would upload to your server/cloud storage here
      // For now, we'll use the file URL
      const imageUrl = URL.createObjectURL(file)

      setUploadProgress(100)
      setTimeout(() => {
        onImageUpload(imageUrl, file)
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onImageRemove) {
      onImageRemove()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {preview ? (
        <Card className="tech-card">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center mt-3 text-sm text-success-600">
              <Check className="h-4 w-4 mr-1" />
              Image uploaded successfully
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "tech-card border-2 border-dashed transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-primary-400 bg-primary-50"
              : "border-primary-200 hover:border-primary-300 hover:bg-primary-50/50",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                {isUploading ? (
                  <div className="animate-spin">
                    <Upload className="h-8 w-8 text-primary-600" />
                  </div>
                ) : (
                  <ImageIcon className="h-8 w-8 text-primary-600" />
                )}
              </div>

              {isUploading ? (
                <div className="w-full space-y-2">
                  <div className="text-center">
                    <p className="text-sm font-medium text-secondary-800">Uploading image...</p>
                    <p className="text-xs text-secondary-500">{uploadProgress}% complete</p>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-secondary-800">
                    Drop your image here, or <span className="text-primary-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-secondary-500">
                    Supports: {acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")} • Max {maxSize}MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="border-destructive-200 bg-destructive-50">
          <AlertCircle className="h-4 w-4 text-destructive-600" />
          <AlertDescription className="text-destructive-800">{error}</AlertDescription>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
