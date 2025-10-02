"use client";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Menu, Bell, Settings, User, LogOut } from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function Header({ onMenuClick }) {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );

  return (
    <header className="fixed top-0 right-0 left-0 z-30 border-b border-gray-200 bg-white lg:left-64">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex-1"></div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 flex size-5 items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage
                    src={user?.imageUrl || ""}
                    alt={user?.fullName || "User"}
                  />
                  <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <Link href="/dashboard/profile">
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>

              <Link href="/dashboard/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />

              <SignOutButton>
                <DropdownMenuItem>
                  <LogOut className="mr-2 size-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
