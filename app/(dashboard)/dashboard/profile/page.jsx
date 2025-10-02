"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
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
  PawPrint,
  PlusCircle,
  Settings,
  Calendar,
  Check,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import PetCard from "@/components/pet-card";
import LoadingSpinner from "@/components/loading-spinner";

export default function ProfilePage() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const userPets = useQuery(
    api.pets.getPetsByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip",
  );
  const applications = useQuery(
    api.applications.getApplicationsByApplicant,
    currentUser?._id ? { applicantId: currentUser._id } : "skip",
  );
  const receivedApplications = useQuery(
    api.applications.getApplicationsByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip",
  );

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="size-4 text-yellow-500" />;
      case "accepted":
        return <Check className="size-4 text-green-500" />;
      case "rejected":
        return <X className="size-4 text-red-500" />;
      default:
        return <Clock className="size-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Profile header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col items-start space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
            <Avatar className="size-24">
              <AvatarImage src={user?.imageUrl} className="object-cover" />
              <AvatarFallback className="text-2xl">
                <User className="size-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {currentUser.name}
                  </h1>

                  <div className="space-y-1 text-gray-600">
                    {currentUser.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="size-4" />
                        <span>{currentUser.location}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Mail className="size-4" />
                      <span>{user?.emailAddresses[0]?.emailAddress}</span>
                    </div>

                    {currentUser.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="size-4" />
                        <span>{currentUser.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex space-x-3 md:mt-0">
                  <Link href="/dashboard/settings">
                    <Button variant="outline">
                      <Settings className="mr-2 size-4" />
                      Edit Profile
                    </Button>
                  </Link>

                  <Link href="/dashboard/add-pet">
                    <Button>
                      <PlusCircle className="mr-2 size-4" />
                      Add Pet
                    </Button>
                  </Link>
                </div>
              </div>

              {currentUser.bio && (
                <p className="mt-4 leading-relaxed">{currentUser.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile content */}
      <div className="space-y-8">
        {/* My pets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <PawPrint className="mr-2 size-5" />
                My pets
              </div>

              <Badge variant="secondary">{userPets?.length || 0} pets</Badge>
            </CardTitle>

            <CardDescription>Pets you have listed for adoption</CardDescription>
          </CardHeader>

          <CardContent>
            {userPets && userPets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userPets.map((pet) => (
                  <PetCard
                    key={pet._id}
                    pet={pet}
                    currentUserId={currentUser._id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <PawPrint className="mx-auto mb-4 size-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No pets listed yet
                </h3>
                <p className="mb-4">
                  Start by adding a pet that needs a loving home
                </p>
                <Link href="/dashboard/add-pet">
                  <Button>
                    <PlusCircle className="mr-2 size-4" />
                    Add your first pet
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Applications you have submitted</CardDescription>
            </CardHeader>

            <CardContent>
              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">Pet Application</h4>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="mb-2 text-sm text-gray-600">
                        Applied on{" "}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>

                      {application.status === "accepted" && (
                        <Link
                          href={`/dashboard/messages?application=${application._id}`}
                        >
                          <Button size="sm" variant="outline">
                            Message Owner
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-2 size-8 text-gray-400" />
                  <p className="text-gray-600">No applications submitted</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Received applications */}
          <Card>
            <CardHeader>
              <CardTitle>Received Applications</CardTitle>
              <CardDescription>
                Applications you have received for your pets
              </CardDescription>
            </CardHeader>

            <CardContent>
              <CardContent>
                {receivedApplications && receivedApplications.length > 0 ? (
                  <div className="space-y-4">
                    {receivedApplications.map((application) => (
                      <div
                        key={application._id}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">Application Received</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <Badge
                              className={getStatusColor(application.status)}
                            >
                              {application.status}
                            </Badge>
                          </div>
                        </div>

                        <p className="mb-2 text-sm text-gray-600">
                          Received on{" "}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>

                        {application.status === "accepted" && (
                          <Link
                            href={`/dashboard/applications/${application._id}`}
                          >
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto mb-2 size-8 text-gray-400" />
                    <p className="text-gray-600">
                      No applications received yet
                    </p>
                  </div>
                )}
              </CardContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
