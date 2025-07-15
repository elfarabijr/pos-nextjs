"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SettingsIcon, Shield, Bell, Save, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react"
import { Layout } from "@/components/layout"

interface SecuritySettings {
  sessionTimeout: number // in minutes
  warningTime: number // in minutes
  autoLockScreen: boolean
  requirePasswordChange: boolean
  passwordChangeInterval: number // in days
  maxLoginAttempts: number
}

interface NotificationSettings {
  lowStockAlerts: boolean
  dailyReports: boolean
  systemUpdates: boolean
  securityAlerts: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

interface SystemSettings {
  currency: string
  taxRate: number
  businessName: string
  businessAddress: string
  receiptFooter: string
  backupFrequency: string
  dataRetention: number // in months
}

export default function SettingsPage() {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 15,
    warningTime: 2,
    autoLockScreen: true,
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    maxLoginAttempts: 3,
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lowStockAlerts: true,
    dailyReports: true,
    systemUpdates: true,
    securityAlerts: true,
    emailNotifications: true,
    pushNotifications: false,
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    currency: "USD",
    taxRate: 8.0,
    businessName: "RetailPOS Store",
    businessAddress: "123 Main St, City, State 12345",
    receiptFooter: "Thank you for your business!",
    backupFrequency: "daily",
    dataRetention: 12,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    // Load settings from localStorage
    const savedSecuritySettings = localStorage.getItem("securitySettings")
    const savedNotificationSettings = localStorage.getItem("notificationSettings")
    const savedSystemSettings = localStorage.getItem("systemSettings")

    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings))
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings))
    }
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings))
    }
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveStatus("idle")

    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem("securitySettings", JSON.stringify(securitySettings))
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings))
      localStorage.setItem("systemSettings", JSON.stringify(systemSettings))

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSaveStatus("success")

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      setSecuritySettings({
        sessionTimeout: 15,
        warningTime: 2,
        autoLockScreen: true,
        requirePasswordChange: false,
        passwordChangeInterval: 90,
        maxLoginAttempts: 3,
      })
      setNotificationSettings({
        lowStockAlerts: true,
        dailyReports: true,
        systemUpdates: true,
        securityAlerts: true,
        emailNotifications: true,
        pushNotifications: false,
      })
      setSystemSettings({
        currency: "USD",
        taxRate: 8.0,
        businessName: "RetailPOS Store",
        businessAddress: "123 Main St, City, State 12345",
        receiptFooter: "Thank you for your business!",
        backupFrequency: "daily",
        dataRetention: 12,
      })
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-secondary-600">Configure your POS system preferences and security settings</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleResetSettings}
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving} className="tech-button text-white font-semibold">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Save Status Alert */}
        {saveStatus === "success" && (
          <Alert className="border-success-200 bg-success-50">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <AlertDescription className="text-success-800">Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="border-destructive-200 bg-destructive-50">
            <AlertTriangle className="h-4 w-4 text-destructive-600" />
            <AlertDescription className="text-destructive-800">
              Failed to save settings. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Security Settings */}
        <Card className="tech-card">
          <CardHeader className="border-b border-primary-100">
            <CardTitle className="flex items-center gap-2 text-secondary-800">
              <Shield className="h-5 w-5 text-primary-600" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-secondary-700 font-medium">
                  Session Timeout (minutes)
                </Label>
                <Select
                  value={securitySettings.sessionTimeout.toString()}
                  onValueChange={(value) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: Number.parseInt(value) })
                  }
                >
                  <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-secondary-500">
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warningTime" className="text-secondary-700 font-medium">
                  Warning Time (minutes)
                </Label>
                <Select
                  value={securitySettings.warningTime.toString()}
                  onValueChange={(value) =>
                    setSecuritySettings({ ...securitySettings, warningTime: Number.parseInt(value) })
                  }
                >
                  <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="2">2 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-secondary-500">Show warning this many minutes before session expires</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts" className="text-secondary-700 font-medium">
                  Max Login Attempts
                </Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number.parseInt(e.target.value) || 3 })
                  }
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500">
                  Account will be locked after this many failed login attempts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordChangeInterval" className="text-secondary-700 font-medium">
                  Password Change Interval (days)
                </Label>
                <Input
                  id="passwordChangeInterval"
                  type="number"
                  min="30"
                  max="365"
                  value={securitySettings.passwordChangeInterval}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordChangeInterval: Number.parseInt(e.target.value) || 90,
                    })
                  }
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                  disabled={!securitySettings.requirePasswordChange}
                />
                <p className="text-xs text-secondary-500">Users must change passwords after this many days</p>
              </div>
            </div>

            <Separator className="bg-primary-200" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-secondary-700 font-medium">Auto-lock Screen</Label>
                  <p className="text-sm text-secondary-500">
                    Automatically lock the screen when session timeout is reached
                  </p>
                </div>
                <Switch
                  checked={securitySettings.autoLockScreen}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, autoLockScreen: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-secondary-700 font-medium">Require Password Change</Label>
                  <p className="text-sm text-secondary-500">Force users to change passwords periodically</p>
                </div>
                <Switch
                  checked={securitySettings.requirePasswordChange}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, requirePasswordChange: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="tech-card">
          <CardHeader className="border-b border-primary-100">
            <CardTitle className="flex items-center gap-2 text-secondary-800">
              <Bell className="h-5 w-5 text-primary-600" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-secondary-700 font-medium">Low Stock Alerts</Label>
                    <p className="text-sm text-secondary-500">Get notified when products are running low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-secondary-700 font-medium">Daily Reports</Label>
                    <p className="text-sm text-secondary-500">Receive daily sales summary reports</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, dailyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-secondary-700 font-medium">System Updates</Label>
                    <p className="text-sm text-secondary-500">Get notified about system updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-secondary-700 font-medium">Security Alerts</Label>
                    <p className="text-sm text-secondary-500">Important security notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, securityAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-secondary-700 font-medium">Email Notifications</Label>
                    <p className="text-sm text-secondary-500">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-secondary-700 font-medium">Push Notifications</Label>
                    <p className="text-sm text-secondary-500">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="tech-card">
          <CardHeader className="border-b border-primary-100">
            <CardTitle className="flex items-center gap-2 text-secondary-800">
              <SettingsIcon className="h-5 w-5 text-primary-600" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-secondary-700 font-medium">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={systemSettings.businessName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, businessName: e.target.value })}
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-secondary-700 font-medium">
                  Currency
                </Label>
                <Select
                  value={systemSettings.currency}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
                >
                  <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-secondary-700 font-medium">
                  Tax Rate (%)
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={systemSettings.taxRate}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, taxRate: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupFrequency" className="text-secondary-700 font-medium">
                  Backup Frequency
                </Label>
                <Select
                  value={systemSettings.backupFrequency}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}
                >
                  <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress" className="text-secondary-700 font-medium">
                Business Address
              </Label>
              <Input
                id="businessAddress"
                value={systemSettings.businessAddress}
                onChange={(e) => setSystemSettings({ ...systemSettings, businessAddress: e.target.value })}
                className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFooter" className="text-secondary-700 font-medium">
                Receipt Footer Message
              </Label>
              <Input
                id="receiptFooter"
                value={systemSettings.receiptFooter}
                onChange={(e) => setSystemSettings({ ...systemSettings, receiptFooter: e.target.value })}
                className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Thank you for your business!"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
