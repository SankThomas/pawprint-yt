"use client";

import React from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import PetCard from "@/components/pet-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PawPrint, Settings } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";

export default function DashboardPage() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const recommendedPets = useQuery(
    api.pets.getRecommendedPets,
    currentUser?._id
      ? {
          userId: currentUser._id,
          preferences: currentUser.preferences,
        }
      : "skip",
  );

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome back, {user?.firstName}!
        </h1>
        <p>Discover your perfect pet companion based on your preferences</p>
      </div>

      {!currentUser.preferences && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Settings className="mr-2 size-5" />
              Set Your Preferences
            </CardTitle>
            <CardDescription className="text-orange-700">
              Help us find the perfect pets for you by setting your preferences
              in your profile settings.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Link href="/dashboard/settings">
              <Button>Update Preferences</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recommended for you</h2>

          <Link href="/dashboard/discover">
            <Button variant="outline">View all pets</Button>
          </Link>
        </div>

        {recommendedPets && recommendedPets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedPets.slice(0, 8).map((pet) => (
              <PetCard
                key={pet._id}
                pet={pet}
                currentUserId={currentUser._id}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <CardContent>
              <PawPrint className="mx-auto mb-4 size-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No pets found</h3>
              <p className="mb-4">
                We couldn't find any pets matching your preferences. Try
                updating your settings or browse all available pets.
              </p>

              <div className="space-x-4">
                <Link href="/dashboard/settings">
                  <Button>Update Preferences</Button>
                </Link>

                <Link href="/dashboard/discover">
                  <Button variant="outline">View all pets</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
