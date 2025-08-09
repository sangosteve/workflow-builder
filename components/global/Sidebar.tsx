"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Workflow,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  History,
  HelpCircle,
  Plug,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
 const { user } = useUser();
  const { signOut } = useClerk();
const handleLogout = () => {
  signOut(() => {
    // Redirect to home page or login page after logout
    window.location.href = "/";
  });
};
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Workflows",
      href: "/workflows",
      icon: <Workflow className="w-5 h-5" />,
    },

       {
      label: "Integrations",
      href: "/integrations",
      icon: <Plug className="w-5 h-5" />,
    },
    {
      label: "Templates",
      href: "/templates",
      icon: <LayoutTemplate className="w-5 h-5" />,
    },
    {
      label: "History",
      href: "/history",
      icon: <History className="w-5 h-5" />,
    },
  ];

  const bottomNavItems = [
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: "Help",
      href: "/help",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Workflow className="h-6 w-6" />
            <span>WorkflowBuilder</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Workflow className="h-6 w-6" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("rounded-full", collapsed && "mx-auto mt-2")}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main navigation */}
      <div className="flex-1 py-6 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="py-6 flex flex-col gap-2 px-2 border-t">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* User dropdown */}
  <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md justify-start",
                collapsed && "justify-center px-0"
              )}
            >
              {user && user.imageUrl ? (
                <Image
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.fullName?.[0] || "U"}
                  </span>
                </div>
              )}
              {!collapsed && (
                <span className="truncate">{user?.fullName || "Account"}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
  Logout
</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}