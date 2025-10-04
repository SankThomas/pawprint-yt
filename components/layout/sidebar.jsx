"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  PawPrint,
  Home,
  Search,
  Bell,
  MessageCircle,
  User,
  Settings,
  X,
  PlusCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Feed",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Discover",
    href: "/dashboard/discover",
    icon: Search,
  },
  {
    name: "Applications",
    href: "/dashboard/applications",
    icon: FileText,
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: MessageCircle,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Add Pet",
    href: "/dashboard/add-pet",
    icon: PlusCircle,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center space-x-2">
            <PawPrint className="size-8 text-orange-500" />
            <span className="text-xl font-bold">PawPrint</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="size-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-3 py-4">
            <nav className="space-y-2">
              {links.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.href === pathname ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={onClose}
                  >
                    <item.icon className="mr-3 size-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
