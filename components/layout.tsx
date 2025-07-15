"use client"

import type React from "react"
import Link from "next/link"
import { Bell, CircleUser, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "./sidebar"
import { SessionManager } from "./session-manager"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [userName, setUserName] = useState("Guest")
  const [userRole, setUserRole] = useState("Guest")

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName")
    const storedUserRole = localStorage.getItem("userRole")
    if (storedUserName) {
      setUserName(storedUserName)
    }
    if (storedUserRole) {
      setUserRole(storedUserRole)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.removeItem("authToken")
    localStorage.setItem("sessionExpired", "true")
    router.push("/login")
  }

  return (
    <SessionManager>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        {/* Main Content */}
        <div className="md:pl-72">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Mobile menu trigger */}
              <div className="md:hidden">
                <Sidebar />
              </div>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products, orders, customers..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    3
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <CircleUser className="h-5 w-5 text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium">{userName}</div>
                        <div className="text-xs text-gray-500">{userRole}</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-gray-500">{userRole}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile" className="w-full">
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings" className="w-full">
                        System Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/help" className="w-full">
                        Help & Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionManager>
  )
}
