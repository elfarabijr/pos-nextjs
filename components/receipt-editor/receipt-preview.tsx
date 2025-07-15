"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, GripVertical } from "lucide-react"
import { useDragDrop } from "./drag-drop-context"

interface ReceiptComponent {
  id: string
  type: string
  props: any
}

interface ReceiptPreviewProps {
  components: ReceiptComponent[]
  onUpdateComponent: (id: string, props: any) => void
  onDeleteComponent: (id: string) => void
  onReorderComponents: (fromIndex: number, toIndex: number) => void
  onSelectComponent: (component: ReceiptComponent | null) => void
  selectedComponent: ReceiptComponent | null
}

// Mock data for preview
const mockData = {
  businessName: "RetailPOS Store",
  businessAddress: "123 Main Street\nCity, State 12345",
  businessPhone: "(555) 123-4567",
  businessEmail: "info@retailpos.com",
  transactionId: "TXN-001234",
  dateTime: new Date().toLocaleString(),
  cashier: "John Doe",
  items: [
    { name: "iPhone 15 Pro", quantity: 1, price: 999.99, total: 999.99 },
    { name: "AirPods Pro", quantity: 2, price: 249.99, total: 499.98 },
    { name: "Phone Case", quantity: 1, price: 29.99, total: 29.99 },
  ],
  subtotal: 1529.96,
  tax: 122.4,
  discount: 50.0,
  total: 1602.36,
  paymentMethod: "Credit Card",
}

export function ReceiptPreview({
  components,
  onUpdateComponent,
  onDeleteComponent,
  onReorderComponents,
  onSelectComponent,
  selectedComponent,
}: ReceiptPreviewProps) {
  const { draggedItem, isDragging, endDrag } = useDragDrop()
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (draggedItem) {
      const newComponent: ReceiptComponent = {
        id: draggedItem.id,
        type: draggedItem.type,
        props: draggedItem.content || {},
      }

      // Add component at the specified index
      const newComponents = [...components]
      newComponents.splice(index, 0, newComponent)

      // This would be handled by parent component
      console.log("Adding component at index", index, newComponent)
      endDrag()
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const renderComponent = (component: ReceiptComponent, index: number) => {
    const isSelected = selectedComponent?.id === component.id

    return (
      <div
        key={component.id}
        className={`relative group ${isSelected ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
        onClick={() => onSelectComponent(component)}
      >
        {/* Drop zone above */}
        <div
          className={`h-2 transition-all duration-200 ${
            dragOverIndex === index ? "bg-primary-200 border-2 border-dashed border-primary-400" : ""
          }`}
          onDrop={(e) => handleDrop(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
        />

        <div className="relative">
          {/* Component controls */}
          <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1">
            <Button size="sm" variant="outline" className="w-6 h-6 p-0 bg-transparent">
              <GripVertical className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-6 h-6 p-0 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onSelectComponent(component)
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteComponent(component.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Actual component */}
          <ComponentRenderer component={component} data={mockData} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-800">Receipt Preview</h2>
          <Badge variant="secondary" className="bg-primary-100 text-primary-700">
            {components.length} components
          </Badge>
        </div>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6" ref={previewRef}>
            <div className="space-y-1 font-mono text-sm">
              {/* Drop zone at the top */}
              <div
                className={`h-4 transition-all duration-200 ${
                  dragOverIndex === 0 ? "bg-primary-200 border-2 border-dashed border-primary-400" : ""
                }`}
                onDrop={(e) => handleDrop(e, 0)}
                onDragOver={(e) => handleDragOver(e, 0)}
                onDragLeave={handleDragLeave}
              />

              {components.length === 0 ? (
                <div className="text-center py-12 text-secondary-500">
                  <p>Drag components here to build your receipt</p>
                </div>
              ) : (
                components.map((component, index) => renderComponent(component, index))
              )}

              {/* Drop zone at the bottom */}
              <div
                className={`h-4 transition-all duration-200 ${
                  dragOverIndex === components.length ? "bg-primary-200 border-2 border-dashed border-primary-400" : ""
                }`}
                onDrop={(e) => handleDrop(e, components.length)}
                onDragOver={(e) => handleDragOver(e, components.length)}
                onDragLeave={handleDragLeave}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ComponentRenderer({ component, data }: { component: ReceiptComponent; data: any }) {
  const { type, props } = component

  const getAlignment = (align: string) => {
    switch (align) {
      case "left":
        return "text-left"
      case "center":
        return "text-center"
      case "right":
        return "text-right"
      default:
        return "text-left"
    }
  }

  const getFontSize = (size: string) => {
    switch (size) {
      case "small":
        return "text-xs"
      case "medium":
        return "text-sm"
      case "large":
        return "text-lg"
      case "xl":
        return "text-xl"
      default:
        return "text-sm"
    }
  }

  switch (type) {
    case "business-name":
      return (
        <div className={`${getAlignment(props.align)} ${getFontSize(props.fontSize)} ${props.bold ? "font-bold" : ""}`}>
          {props.text || data.businessName}
        </div>
      )

    case "business-address":
      return (
        <div className={`${getAlignment(props.align)} text-xs space-y-0.5`}>
          <div>{props.address || data.businessAddress}</div>
          {props.phone && <div>{props.phone || data.businessPhone}</div>}
          {props.email && <div>{props.email || data.businessEmail}</div>}
        </div>
      )

    case "logo":
      return (
        <div className={getAlignment(props.align)}>
          <div
            className="bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-xs"
            style={{ width: props.width || 100, height: props.height || 50 }}
          >
            LOGO
          </div>
        </div>
      )

    case "transaction-id":
      return (
        <div className={getAlignment(props.align)}>
          {props.label} {data.transactionId}
        </div>
      )

    case "date-time":
      return <div className={getAlignment(props.align)}>{data.dateTime}</div>

    case "cashier":
      return (
        <div className={getAlignment(props.align)}>
          {props.label} {data.cashier}
        </div>
      )

    case "items-table":
      return (
        <div className="space-y-1">
          {props.showHeaders && (
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="flex-1">Item</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-16 text-right">Total</span>
            </div>
          )}
          {data.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span className="flex-1 truncate">{item.name}</span>
              <span className="w-12 text-center">{item.quantity}</span>
              <span className="w-16 text-right">${item.price.toFixed(2)}</span>
              <span className="w-16 text-right">${item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )

    case "subtotal":
      return (
        <div className={`flex justify-between ${getAlignment(props.align)}`}>
          <span>{props.label}</span>
          <span>${data.subtotal.toFixed(2)}</span>
        </div>
      )

    case "tax":
      return (
        <div className={`flex justify-between ${getAlignment(props.align)}`}>
          <span>{props.label}</span>
          <span>${data.tax.toFixed(2)}</span>
        </div>
      )

    case "discount":
      return data.discount > 0 ? (
        <div className={`flex justify-between ${getAlignment(props.align)}`}>
          <span>{props.label}</span>
          <span>-${data.discount.toFixed(2)}</span>
        </div>
      ) : null

    case "total":
      return (
        <div
          className={`flex justify-between ${getAlignment(props.align)} ${getFontSize(props.fontSize)} ${props.bold ? "font-bold" : ""} border-t border-gray-300 pt-1`}
        >
          <span>{props.label}</span>
          <span>${data.total.toFixed(2)}</span>
        </div>
      )

    case "payment-method":
      return (
        <div className={getAlignment(props.align)}>
          {props.label} {data.paymentMethod}
        </div>
      )

    case "divider":
      return (
        <div
          className={`border-gray-300 ${props.style === "dashed" ? "border-dashed" : "border-solid"}`}
          style={{ borderTopWidth: props.thickness || 1 }}
        />
      )

    case "spacer":
      return <div style={{ height: props.height || 10 }} />

    case "text":
      return (
        <div
          className={`${getAlignment(props.align)} ${props.bold ? "font-bold" : ""} ${props.italic ? "italic" : ""} ${getFontSize(props.fontSize)}`}
        >
          {props.text}
        </div>
      )

    case "footer-message":
      return (
        <div className={`${getAlignment(props.align)} ${props.italic ? "italic" : ""} ${getFontSize(props.fontSize)}`}>
          {props.text}
        </div>
      )

    default:
      return <div>Unknown component: {type}</div>
  }
}
