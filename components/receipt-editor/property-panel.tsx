"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Settings } from "lucide-react"

interface ReceiptComponent {
  id: string
  type: string
  props: any
}

interface PropertyPanelProps {
  selectedComponent: ReceiptComponent | null
  onUpdateComponent: (id: string, props: any) => void
}

export function PropertyPanel({ selectedComponent, onUpdateComponent }: PropertyPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="w-80 bg-white border-l border-primary-200 p-4">
        <div className="text-center text-secondary-500 mt-8">
          <Settings className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    )
  }

  const updateProp = (key: string, value: any) => {
    onUpdateComponent(selectedComponent.id, {
      ...selectedComponent.props,
      [key]: value,
    })
  }

  const renderProperties = () => {
    const { type, props } = selectedComponent

    switch (type) {
      case "business-name":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Business Name</Label>
              <Input
                id="text"
                value={props.text || ""}
                onChange={(e) => updateProp("text", e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={props.fontSize || "medium"} onValueChange={(value) => updateProp("fontSize", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="align">Alignment</Label>
              <Select value={props.align || "center"} onValueChange={(value) => updateProp("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="bold"
                checked={props.bold || false}
                onCheckedChange={(checked) => updateProp("bold", checked)}
              />
              <Label htmlFor="bold">Bold</Label>
            </div>
          </div>
        )

      case "business-address":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={props.address || ""}
                onChange={(e) => updateProp("address", e.target.value)}
                placeholder="123 Main St, City, State 12345"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={props.phone || ""}
                onChange={(e) => updateProp("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={props.email || ""}
                onChange={(e) => updateProp("email", e.target.value)}
                placeholder="info@business.com"
              />
            </div>
            <div>
              <Label htmlFor="align">Alignment</Label>
              <Select value={props.align || "center"} onValueChange={(value) => updateProp("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "logo":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Slider
                value={[props.width || 100]}
                onValueChange={(value) => updateProp("width", value[0])}
                max={200}
                min={50}
                step={10}
                className="mt-2"
              />
              <div className="text-sm text-secondary-500 mt-1">{props.width || 100}px</div>
            </div>
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Slider
                value={[props.height || 50]}
                onValueChange={(value) => updateProp("height", value[0])}
                max={100}
                min={25}
                step={5}
                className="mt-2"
              />
              <div className="text-sm text-secondary-500 mt-1">{props.height || 50}px</div>
            </div>
            <div>
              <Label htmlFor="align">Alignment</Label>
              <Select value={props.align || "center"} onValueChange={(value) => updateProp("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "transaction-id":
      case "cashier":
      case "payment-method":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={props.label || ""}
                onChange={(e) => updateProp("label", e.target.value)}
                placeholder="Label text"
              />
            </div>
            <div>
              <Label htmlFor="align">Alignment</Label>
              <Select value={props.align || "left"} onValueChange={(value) => updateProp("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "items-table":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showHeaders"
                checked={props.showHeaders || false}
                onCheckedChange={(checked) => updateProp("showHeaders", checked)}
              />
              <Label htmlFor="showHeaders">Show Headers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="borders"
                checked={props.borders || false}
                onCheckedChange={(checked) => updateProp("borders", checked)}
              />
              <Label htmlFor="borders">Show Borders</Label>
            </div>
          </div>
        )

      case "subtotal":
      case "tax":
      case "discount":
      case "total":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={props.label || ""}
                onChange={(e) => updateProp("label", e.target.value)}
                placeholder="Label text"
              />
            </div>
            <div>
              <Label htmlFor="align">Alignment</Label>
              <Select value={props.align || "right"} onValueChange={(value) => updateProp("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "total" && (
              <>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={props.fontSize || "medium"} onValueChange={(value) => updateProp("fontSize", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bold"
                    checked={props.bold || false}
                    onCheckedChange={(checked) => updateProp("bold", checked)}
                  />
                  <Label htmlFor="bold">Bold</Label>
                </div>
              </>
            )}
          </div>
        )

      case "divider":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={props.style || "solid"} onValueChange={(value) => updateProp("style", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="thickness">Thickness (px)</Label>
              <Slider
                value={[props.thickness || 1]}
                onValueChange={(value) => updateProp("thickness", value[0])}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="text-sm text-secondary-500 mt-1">{props.thickness || 1}px</div>
            </div>
          </div>
        )

      case "spacer":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Slider
                value={[props.height || 10]}
                onValueChange={(value) => updateProp("height", value[0])}
                max={50}
                min={5}
                step={5}
                className="mt-2"
              />
              <div className="text-sm text-secondary-500 mt-1">{props.height || 10}px</div>
            </div>
          </div>
        )

      case "text":
      case "footer-message":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                value={props.text || ""}
                onChange={(e) => updateProp("text", e.target.value)}
                placeholder="Enter your text"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={props.fontSize || "medium"} onValueChange={(value) => updateProp("fontSize", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="align">Alignment</Label>
              <Select value={props.align || "center"} onValueChange={(value) => updateProp("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="bold"
                checked={props.bold || false}
                onCheckedChange={(checked) => updateProp("bold", checked)}
              />
              <Label htmlFor="bold">Bold</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="italic"
                checked={props.italic || false}
                onCheckedChange={(checked) => updateProp("italic", checked)}
              />
              <Label htmlFor="italic">Italic</Label>
            </div>
          </div>
        )

      default:
        return <div>No properties available for this component</div>
    }
  }

  const getComponentName = (type: string) => {
    const names: { [key: string]: string } = {
      "business-name": "Business Name",
      "business-address": "Business Address",
      logo: "Logo",
      "transaction-id": "Transaction ID",
      "date-time": "Date & Time",
      cashier: "Cashier",
      "items-table": "Items Table",
      subtotal: "Subtotal",
      tax: "Tax",
      discount: "Discount",
      total: "Total",
      "payment-method": "Payment Method",
      divider: "Divider",
      spacer: "Spacer",
      text: "Custom Text",
      "footer-message": "Footer Message",
    }
    return names[type] || type
  }

  return (
    <div className="w-80 bg-white border-l border-primary-200 overflow-y-auto">
      <div className="p-4 border-b border-primary-100">
        <h2 className="text-lg font-semibold text-secondary-800">Properties</h2>
        <p className="text-sm text-secondary-600">{getComponentName(selectedComponent.type)}</p>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Component Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">{renderProperties()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
