"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Clock,
  Plus,
  Eye,
  Settings,
  FileText,
  Zap,
  Activity,
  Target,
} from "lucide-react"
import Link from "next/link"
import { Layout } from "@/components/layout"

// Mock data
const mockData = {
  todaySales: 2450.75,
  totalProducts: 156,
  lowStockItems: 8,
  activeUsers: 3,
  weeklyGrowth: 12.5,
  monthlyRevenue: 18750.25,
  totalOrders: 89,
  avgOrderValue: 27.53,
  recentTransactions: [
    { id: "TXN001", amount: 45.99, time: "2 min ago", items: 3, customer: "John Doe" },
    { id: "TXN002", amount: 128.5, time: "5 min ago", items: 7, customer: "Sarah Wilson" },
    { id: "TXN003", amount: 23.75, time: "8 min ago", items: 2, customer: "Mike Johnson" },
    { id: "TXN004", amount: 89.25, time: "12 min ago", items: 4, customer: "Emma Davis" },
  ],
  lowStockProducts: [
    { name: "iPhone 15 Pro", stock: 2, category: "Electronics", sku: "IPH15P-256" },
    { name: "Nike Air Max", stock: 1, category: "Footwear", sku: "NAM-90-BLK" },
    { name: "Samsung Galaxy S24", stock: 3, category: "Electronics", sku: "SGS24-128" },
    { name: "Adidas Hoodie", stock: 2, category: "Clothing", sku: "ADH-XL-GRY" },
  ],
  quickActions: [
    {
      title: "New Sale",
      description: "Process a new transaction",
      icon: ShoppingCart,
      href: "/pos",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-white",
      priority: "high",
    },
    {
      title: "Add Product",
      description: "Add new inventory item",
      icon: Plus,
      href: "/products?action=add",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-white",
      priority: "high",
    },
    {
      title: "View Reports",
      description: "Sales and analytics",
      icon: BarChart3,
      href: "/reports",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-white",
      priority: "medium",
    },
    {
      title: "Manage Users",
      description: "User accounts & roles",
      icon: Users,
      href: "/users",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-white",
      priority: "medium",
    },
  ],
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Live</span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockData.quickActions.map((action, index) => (
              <Link key={index} href={action.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 overflow-hidden">
                  <CardContent className={`p-6 ${action.color} relative`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <action.icon className={`h-8 w-8 ${action.textColor}`} />
                        {action.priority === "high" && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            Priority
                          </Badge>
                        )}
                      </div>
                      <h3 className={`font-bold text-lg ${action.textColor} mb-1`}>{action.title}</h3>
                      <p className={`text-sm ${action.textColor} opacity-90`}>{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Key Metrics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Today's Sales</CardTitle>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">${mockData.todaySales.toFixed(2)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 font-medium">+{mockData.weeklyGrowth}% from yesterday</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">{mockData.totalProducts}</div>
                <p className="text-xs text-blue-600 mt-1">Across all categories</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Low Stock Alert</CardTitle>
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-800">{mockData.lowStockItems}</div>
                <p className="text-xs text-amber-600 mt-1">Items need restocking</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Active Users</CardTitle>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">{mockData.activeUsers}</div>
                <p className="text-xs text-purple-600 mt-1">Currently online</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Management Tools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/products" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-blue-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        Product Catalog
                      </h3>
                      <p className="text-sm text-gray-600">Manage inventory & pricing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/categories" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-green-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                        Categories
                      </h3>
                      <p className="text-sm text-gray-600">Organize product groups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/inventory" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-purple-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        Inventory Tracking
                      </h3>
                      <p className="text-sm text-gray-600">Stock levels & analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/users" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-orange-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                        User Management
                      </h3>
                      <p className="text-sm text-gray-600">Staff accounts & permissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-indigo-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        Sales Reports
                      </h3>
                      <p className="text-sm text-gray-600">Analytics & insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-gray-400">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">
                        System Settings
                      </h3>
                      <p className="text-sm text-gray-600">Configure preferences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Transactions
                </CardTitle>
                <Link href="/pos">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockData.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.id}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.customer} • {transaction.items} items • {transaction.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">${transaction.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Inventory Alerts
                </CardTitle>
                <Link href="/inventory">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Manage Stock
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockData.lowStockProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.category} • SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
