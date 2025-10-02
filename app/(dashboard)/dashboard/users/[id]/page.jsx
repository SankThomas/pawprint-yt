"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  PawPrint,
  Calendar,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import PetCard from "@/components/pet-card";
import LoadingSpinner from "@/components/loading-spinner";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  const profileUser = useQuery(api.users.getUserById, { id: id });
  const userPets = useQuery(
    api.pets.getPetsByOwner,
    id ? { ownerId: id } : "skip",
  );

  if (!currentUser || !profileUser) {
    return <LoadingSpinner />;
  }

  const isOwnProfile = currentUser._id === profileUser._id;
  const availablePets = userPets?.filter((pet) => pet.isAvailable || []);

  return (
    <div className="mx auto max-w-6x p-4 sm:p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Profile info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <Avatar className="mx-auto mb-4 size-24 sm:size-32">
                  <AvatarImage
                    src={profileUser?.profileImage}
                    className="object-cover"
                  ></AvatarImage>
                  <AvatarFallback className="text-2xl">
                    <User className="size-12 sm:size-16" />
                  </AvatarFallback>
                </Avatar>

                <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
                  {profileUser.name}
                </h1>

                {profileUser.bio && (
                  <div className="mb-4 leading-relaxed">{profileUser.bip}</div>
                )}

                <div className="space-y-3 text-left">
                  {profileUser.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="size-4 flex-shrink-0" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Mail className="size-4 flex-shrink-0" />
                    <span>{profileUser.email}</span>
                  </div>

                  {profileUser.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="size-4 flex-shrink-0" />
                      <span>{profileUser.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="size-4 flex-shrink-0" />
                    <span>
                      Joined{" "}
                      {new Date(profileUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="mt-6 space-y-3">
                    <Link href="/dashboard/settings" className="block">
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </Link>

                    <Link href="/dashboard/add-pet" className="block">
                      <Button className="w-full">Add Pet</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Total pets</span>
                  <Badge variant="secondary">{userPets?.length || 0}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Available pets</span>
                  <Badge className="bg-green-100 text-green-800">
                    {availablePets?.length || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pets section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <PawPrint className="mr-2 size-5" />
                    {isOwnProfile ? "My Pets" : `${profileUser.name}'s pets`}
                  </CardTitle>

                  <CardDescription>
                    {isOwnProfile
                      ? "Pets you have listed for adoption"
                      : "Pets available for adoption"}
                  </CardDescription>
                </div>

                <Badge
                  variant="secondary"
                  className="self-start sm:self-center"
                >
                  {availablePets?.length} available
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {availablePets?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  {availablePets.map((pet) => (
                    <PetCard
                      key={pet._id}
                      pet={pet}
                      currentUserId={currentUser._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center sm:py-12">
                  <PawPrint className="mx-autoo mb-4 size-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {isOwnProfile ? "No pets listed yet" : "No pets available"}
                  </h3>
                  <p className="mb-4">
                    {isOwnProfile
                      ? "Start by adding a pet that needs a loving home"
                      : "This user has not listed ay pets for adoption yet"}
                  </p>

                  {isOwnProfile && (
                    <Link href="/dashboard/add-pet">
                      <Button>Add your first pet</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          {isOwnProfile && currentUser.preferences && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
                <CardDescription>
                  These preferences help us recommend the perfect pets for you
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {currentUser.preferences.petType &&
                    currentUser.preferences.petType.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Pet Types
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.preferences.petType.map((type) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="capitalize"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {currentUser.preferences.size &&
                    currentUser.preferences.size.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Preferred sizes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.preferences.size.map((size) => (
                            <Badge
                              key={size}
                              variant="outline"
                              className="capitalize"
                            >
                              {size}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {currentUser.preferences.activityLevel && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">
                        Activity Level
                      </h4>
                      <Badge variant="outline" className="capitalize">
                        {currentUser.preferences.activityLevel}
                      </Badge>
                    </div>
                  )}

                  {currentUser.preferences.experience && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">
                        Experience
                      </h4>
                      <Badge variant="outline" className="capitalize">
                        {currentUser.preferences.experience.replace("-", " ")}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Link href="/dashboard/settings">
                    <Button variant="default" size="sm">
                      Update preferences
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
