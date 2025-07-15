"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ShoppingCart, Package, Users, BarChart3, Settings, Tag, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MainNav() {
  const pathname = usePathname()

  const navSections = [
    {
      title: "Overview",
      items: [
        { href: "/", icon: Home, label: "Dashboard", badge: null },
        { href: "/pos", icon: ShoppingCart, label: "Point of Sale", badge: "Hot" },
      ],
    },
    {
      title: "Inventory",
      items: [
        { href: "/products", icon: Package, label: "Products", badge: null },
        { href: "/categories", icon: Tag, label: "Categories", badge: null },
        { href: "/inventory", icon: BarChart3, label: "Stock Levels", badge: null },
      ],
    },
    {
      title: "Analytics",
      items: [
        { href: "/reports", icon: TrendingUp, label: "Sales Reports", badge: null },
        { href: "/analytics", icon: BarChart3, label: "Analytics", badge: "New" },
      ],
    },
    {
      title: "Management",
      items: [
        { href: "/users", icon: Users, label: "User Management", badge: null },
        { href: "/settings", icon: Settings, label: "Settings", badge: null },
      ],
    },
  ]

  return (
    <nav className="space-y-6 px-3">
      {navSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-5 h-5 transition-colors",
                    pathname === item.href ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badge === "Hot" ? "destructive" : "secondary"}
                    className={cn(
                      "text-xs px-2 py-0.5 h-5",
                      item.badge === "Hot" ? "bg-red-500 text-white" : "bg-green-500 text-white",
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
                {pathname === item.href && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
