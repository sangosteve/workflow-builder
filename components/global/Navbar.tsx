"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Workflow, Settings, Bell, User, Menu, Home } from "lucide-react";

const Navbar = () => {
    const pathname = usePathname();

    const navItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <Home className="w-4 h-4" />,
        },
        {
            label: "Workflows",
            href: "/workflows",
            icon: <Workflow className="w-4 h-4" />,
        },
        {
            label: "Templates",
            href: "/templates",
            icon: <Workflow className="w-4 h-4" />,
        },
    ];

    return (
        <nav className="border-b bg-background px-4 py-3">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo and Brand */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        <Workflow className="h-6 w-6" />
                        <span>WorkflowBuilder</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <Settings className="h-5 w-5" />
                    </Button>

                    {/* User dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <User className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile menu button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 md:hidden">
                            {navItems.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href} className="flex items-center gap-2 w-full">
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;