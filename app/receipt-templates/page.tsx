"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Copy, Download, Upload, Eye, FileText, Palette, Settings } from "lucide-react"
import { Layout } from "@/components/layout"
import { DragDropProvider } from "@/components/receipt-editor/drag-drop-context"
import { ComponentLibrary } from "@/components/receipt-editor/component-library"
import { ReceiptPreview } from "@/components/receipt-editor/receipt-preview"
import { PropertyPanel } from "@/components/receipt-editor/property-panel"

interface ReceiptTemplate {
  id: string
  name: string
  description: string
  isDefault: boolean
  lastModified: string
  components: Array<{
    id: string
    type: string
    props: any
  }>
}

interface ReceiptComponent {
  id: string
  type: string
  props: any
}

const initialTemplates: ReceiptTemplate[] = [
  {
    id: "default",
    name: "Default Receipt",
    description: "Standard receipt template with all basic elements",
    isDefault: true,
    lastModified: "2024-01-14",
    components: [
      {
        id: "1",
        type: "business-name",
        props: { text: "RetailPOS Store", fontSize: "large", align: "center", bold: true },
      },
      {
        id: "2",
        type: "business-address",
        props: { address: "123 Main Street\nCity, State 12345", phone: "(555) 123-4567", align: "center" },
      },
      { id: "3", type: "divider", props: { style: "solid", thickness: 1 } },
      { id: "4", type: "transaction-id", props: { label: "Transaction #:", align: "left" } },
      { id: "5", type: "date-time", props: { format: "MM/DD/YYYY HH:mm", align: "left" } },
      { id: "6", type: "cashier", props: { label: "Served by:", align: "left" } },
      { id: "7", type: "divider", props: { style: "solid", thickness: 1 } },
      {
        id: "8",
        type: "items-table",
        props: { showHeaders: true, columns: ["item", "qty", "price", "total"], borders: false },
      },
      { id: "9", type: "divider", props: { style: "solid", thickness: 1 } },
      { id: "10", type: "subtotal", props: { label: "Subtotal:", align: "right" } },
      { id: "11", type: "tax", props: { label: "Tax:", align: "right" } },
      { id: "12", type: "total", props: { label: "TOTAL:", align: "right", bold: true, fontSize: "large" } },
      { id: "13", type: "divider", props: { style: "solid", thickness: 1 } },
      { id: "14", type: "payment-method", props: { label: "Payment:", align: "left" } },
      { id: "15", type: "spacer", props: { height: 20 } },
      {
        id: "16",
        type: "footer-message",
        props: { text: "Thank you for your business!", align: "center", italic: true },
      },
    ],
  },
  {
    id: "minimal",
    name: "Minimal Receipt",
    description: "Clean and simple receipt design",
    isDefault: false,
    lastModified: "2024-01-12",
    components: [
      {
        id: "1",
        type: "business-name",
        props: { text: "Store Name", fontSize: "medium", align: "center", bold: true },
      },
      { id: "2", type: "spacer", props: { height: 10 } },
      { id: "3", type: "items-table", props: { showHeaders: false, borders: false } },
      { id: "4", type: "spacer", props: { height: 10 } },
      { id: "5", type: "total", props: { label: "Total:", align: "right", bold: true } },
      { id: "6", type: "spacer", props: { height: 10 } },
      { id: "7", type: "footer-message", props: { text: "Thanks!", align: "center" } },
    ],
  },
]

export default function ReceiptTemplatesPage() {
  const [templates, setTemplates] = useState<ReceiptTemplate[]>(initialTemplates)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReceiptTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const [selectedComponent, setSelectedComponent] = useState<ReceiptComponent | null>(null)

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return

    const newTemplate: ReceiptTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDescription,
      isDefault: false,
      lastModified: new Date().toISOString().split("T")[0],
      components: [],
    }

    setTemplates([...templates, newTemplate])
    setEditingTemplate(newTemplate)
    setShowEditor(true)
    setShowCreateDialog(false)
    setNewTemplateName("")
    setNewTemplateDescription("")
  }

  const handleEditTemplate = (template: ReceiptTemplate) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(templates.filter((t) => t.id !== id))
    }
  }

  const handleDuplicateTemplate = (template: ReceiptTemplate) => {
    const duplicated: ReceiptTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      lastModified: new Date().toISOString().split("T")[0],
    }
    setTemplates([...templates, duplicated])
  }

  const handleSetDefault = (id: string) => {
    setTemplates(
      templates.map((t) => ({
        ...t,
        isDefault: t.id === id,
      })),
    )
  }

  const handleUpdateComponent = (id: string, props: any) => {
    if (!editingTemplate) return

    const updatedComponents = editingTemplate.components.map((comp) => (comp.id === id ? { ...comp, props } : comp))

    const updatedTemplate = {
      ...editingTemplate,
      components: updatedComponents,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setEditingTemplate(updatedTemplate)
    setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
  }

  const handleDeleteComponent = (id: string) => {
    if (!editingTemplate) return

    const updatedComponents = editingTemplate.components.filter((comp) => comp.id !== id)
    const updatedTemplate = {
      ...editingTemplate,
      components: updatedComponents,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setEditingTemplate(updatedTemplate)
    setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
    setSelectedComponent(null)
  }

  const handleReorderComponents = (fromIndex: number, toIndex: number) => {
    if (!editingTemplate) return

    const components = [...editingTemplate.components]
    const [removed] = components.splice(fromIndex, 1)
    components.splice(toIndex, 0, removed)

    const updatedTemplate = {
      ...editingTemplate,
      components,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setEditingTemplate(updatedTemplate)
    setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
  }

  const handleAddComponent = (component: ReceiptComponent, index: number) => {
    if (!editingTemplate) return

    const components = [...editingTemplate.components]
    components.splice(index, 0, component)

    const updatedTemplate = {
      ...editingTemplate,
      components,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setEditingTemplate(updatedTemplate)
    setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
  }

  const handleSaveTemplate = () => {
    setShowEditor(false)
    setEditingTemplate(null)
    setSelectedComponent(null)
  }

  if (showEditor && editingTemplate) {
    return (
      <DragDropProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-accent-50/30">
          {/* Editor Header */}
          <div className="bg-white border-b border-primary-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-secondary-800">Receipt Template Editor</h1>
                <p className="text-secondary-600">Editing: {editingTemplate.name}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditor(false)}
                  className="border-primary-200 text-primary-700 hover:bg-primary-50"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} className="tech-button text-white">
                  Save Template
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Layout */}
          <div className="flex h-[calc(100vh-80px)]">
            <ComponentLibrary />
            <ReceiptPreview
              components={editingTemplate.components}
              onUpdateComponent={handleUpdateComponent}
              onDeleteComponent={handleDeleteComponent}
              onReorderComponents={handleReorderComponents}
              onSelectComponent={setSelectedComponent}
              selectedComponent={selectedComponent}
            />
            <PropertyPanel selectedComponent={selectedComponent} onUpdateComponent={handleUpdateComponent} />
          </div>
        </div>
      </DragDropProvider>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Receipt Templates
            </h1>
            <p className="text-secondary-600">Design and manage your receipt templates</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Template
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="tech-button text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Enter template description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTemplate} className="flex-1">
                      Create Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="tech-card hover:shadow-tech-lg transition-all duration-200">
              <CardHeader className="border-b border-primary-100">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-secondary-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-600" />
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="default" className="bg-success-500 text-white text-xs">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-secondary-600 mt-1">{template.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="text-sm text-secondary-500">
                    <p>Components: {template.components.length}</p>
                    <p>Last modified: {template.lastModified}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleEditTemplate(template)} className="tech-button text-white">
                      <Palette className="h-3 w-3 mr-1" />
                      Design
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                      className="border-primary-200 text-primary-700 hover:bg-primary-50"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-primary-100">
                    <div className="flex gap-1">
                      {!template.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(template.id)}
                          className="text-xs border-success-200 text-success-700 hover:bg-success-50"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    {!template.isDefault && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="tech-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Total Templates</p>
                  <p className="text-2xl font-bold text-secondary-800">{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tech-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Active Template</p>
                  <p className="text-lg font-semibold text-secondary-800">
                    {templates.find((t) => t.isDefault)?.name || "None"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tech-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Last Modified</p>
                  <p className="text-lg font-semibold text-secondary-800">
                    {Math.max(...templates.map((t) => new Date(t.lastModified).getTime()))
                      ? new Date(
                          Math.max(...templates.map((t) => new Date(t.lastModified).getTime())),
                        ).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
