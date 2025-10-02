"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import LoadingSpinner from "@/components/loading-spinner";

export default function DashboardLayout({ children }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const createUser = useMutation(api.users.createUser);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/signin");
    }
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    if (user && !currentUser) {
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || `${user.firstName} ${user.lastName}` || "User",
        profileImage: user.imageUrl || undefined,
      });
    }
  }, [user, currentUser, createUser]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isLoaded || !isSignedIn) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-16 lg:pl-64">{children}</main>
      </div>
    </div>
  );
}
