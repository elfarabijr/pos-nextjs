"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Type,
  ImageIcon,
  Minus,
  BarChart3,
  Calendar,
  MapPin,
  CreditCard,
  Hash,
  DollarSign,
  Package,
  User,
  Building,
} from "lucide-react"
import { useDragDrop } from "./drag-drop-context"

interface ComponentItem {
  id: string
  type: string
  name: string
  icon: React.ReactNode
  category: string
  description: string
  defaultProps?: any
}

const componentLibrary: ComponentItem[] = [
  // Header Components
  {
    id: "business-name",
    type: "business-name",
    name: "Business Name",
    icon: <Building className="h-4 w-4" />,
    category: "Header",
    description: "Store or business name",
    defaultProps: { text: "Your Business Name", fontSize: "large", align: "center", bold: true },
  },
  {
    id: "business-address",
    type: "business-address",
    name: "Business Address",
    icon: <MapPin className="h-4 w-4" />,
    category: "Header",
    description: "Business address and contact info",
    defaultProps: {
      address: "123 Main St, City, State 12345",
      phone: "(555) 123-4567",
      email: "info@business.com",
      align: "center",
    },
  },
  {
    id: "logo",
    type: "logo",
    name: "Logo",
    icon: <ImageIcon className="h-4 w-4" />,
    category: "Header",
    description: "Business logo image",
    defaultProps: { width: 100, height: 50, align: "center" },
  },

  // Transaction Info
  {
    id: "transaction-id",
    type: "transaction-id",
    name: "Transaction ID",
    icon: <Hash className="h-4 w-4" />,
    category: "Transaction",
    description: "Unique transaction identifier",
    defaultProps: { label: "Transaction #", align: "left" },
  },
  {
    id: "date-time",
    type: "date-time",
    name: "Date & Time",
    icon: <Calendar className="h-4 w-4" />,
    category: "Transaction",
    description: "Transaction date and time",
    defaultProps: { format: "MM/DD/YYYY HH:mm", align: "left" },
  },
  {
    id: "cashier",
    type: "cashier",
    name: "Cashier",
    icon: <User className="h-4 w-4" />,
    category: "Transaction",
    description: "Cashier or employee name",
    defaultProps: { label: "Served by:", align: "left" },
  },

  // Items
  {
    id: "items-table",
    type: "items-table",
    name: "Items Table",
    icon: <Package className="h-4 w-4" />,
    category: "Items",
    description: "Table of purchased items",
    defaultProps: {
      showHeaders: true,
      columns: ["item", "qty", "price", "total"],
      borders: true,
    },
  },

  // Totals
  {
    id: "subtotal",
    type: "subtotal",
    name: "Subtotal",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Totals",
    description: "Subtotal amount",
    defaultProps: { label: "Subtotal:", align: "right" },
  },
  {
    id: "tax",
    type: "tax",
    name: "Tax",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Totals",
    description: "Tax amount",
    defaultProps: { label: "Tax:", align: "right" },
  },
  {
    id: "discount",
    type: "discount",
    name: "Discount",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Totals",
    description: "Discount amount",
    defaultProps: { label: "Discount:", align: "right" },
  },
  {
    id: "total",
    type: "total",
    name: "Total",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Totals",
    description: "Final total amount",
    defaultProps: { label: "TOTAL:", align: "right", bold: true, fontSize: "large" },
  },

  // Payment
  {
    id: "payment-method",
    type: "payment-method",
    name: "Payment Method",
    icon: <CreditCard className="h-4 w-4" />,
    category: "Payment",
    description: "Payment method used",
    defaultProps: { label: "Payment:", align: "left" },
  },

  // Layout
  {
    id: "divider",
    type: "divider",
    name: "Divider",
    icon: <Minus className="h-4 w-4" />,
    category: "Layout",
    description: "Horizontal line separator",
    defaultProps: { style: "solid", thickness: 1 },
  },
  {
    id: "spacer",
    type: "spacer",
    name: "Spacer",
    icon: <BarChart3 className="h-4 w-4" />,
    category: "Layout",
    description: "Empty space",
    defaultProps: { height: 10 },
  },
  {
    id: "text",
    type: "text",
    name: "Custom Text",
    icon: <Type className="h-4 w-4" />,
    category: "Layout",
    description: "Custom text content",
    defaultProps: { text: "Custom text", align: "center" },
  },

  // Footer
  {
    id: "footer-message",
    type: "footer-message",
    name: "Footer Message",
    icon: <Type className="h-4 w-4" />,
    category: "Footer",
    description: "Thank you or promotional message",
    defaultProps: { text: "Thank you for your business!", align: "center", italic: true },
  },
]

const categories = ["Header", "Transaction", "Items", "Totals", "Payment", "Layout", "Footer"]

export function ComponentLibrary() {
  const { startDrag } = useDragDrop()

  const handleDragStart = (component: ComponentItem) => {
    startDrag({
      id: `new-${Date.now()}`,
      type: component.type,
      content: component.defaultProps,
    })
  }

  return (
    <div className="w-80 bg-white border-r border-primary-200 overflow-y-auto">
      <div className="p-4 border-b border-primary-100">
        <h2 className="text-lg font-semibold text-secondary-800">Component Library</h2>
        <p className="text-sm text-secondary-600">Drag components to build your receipt</p>
      </div>

      <div className="p-4 space-y-6">
        {categories.map((category) => {
          const categoryComponents = componentLibrary.filter((comp) => comp.category === category)

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-secondary-700 uppercase tracking-wide">{category}</h3>
              <div className="space-y-2">
                {categoryComponents.map((component) => (
                  <Card
                    key={component.id}
                    className="cursor-grab hover:shadow-tech transition-all duration-200 border-primary-200"
                    draggable
                    onDragStart={() => handleDragStart(component)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          {component.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-secondary-800 truncate">{component.name}</h4>
                          <p className="text-xs text-secondary-500 truncate">{component.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
