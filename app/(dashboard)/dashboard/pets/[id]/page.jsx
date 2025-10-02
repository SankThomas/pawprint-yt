"use client";

import LoadingSpinner from "@/components/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Check,
  Home,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Stethoscope,
  User,
  Users,
  Weight,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PetPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const pet = useQuery(api.pets.getPetById, { id: id });
  const owner = useQuery(
    api.users.getUserById,
    pet?.ownerId ? { id: pet.ownerId } : "skip",
  );
  const application = useQuery(
    api.applications.getApplicationByPetAndApplicant,
    currentUser?._id && pet?._id
      ? {
          petId: pet._id,
          applicantId: currentUser._id,
        }
      : "skip",
  );

  if (!pet || !currentUser) {
    return <LoadingSpinner />;
  }

  const isOwner = pet.ownerId === currentUser._id;

  const getApplicationStatus = () => {
    if (!application) return null;
    return application.status;
  };

  const getActionButton = () => {
    if (isOwner) {
      return (
        <Link href={`/dashboard/pets/${pet._id}/edit`}>
          <Button className="w-full">Edit Pet Details</Button>
        </Link>
      );
    }

    const status = getApplicationStatus();

    if (!status) {
      return (
        <Link href={`/dashboard/pets/${pet._id}/adopt`}>
          <Button className="w-full">Start Adoption Process</Button>
        </Link>
      );
    }

    switch (status) {
      case "pending":
        return (
          <Button className="w-full" variant="secondary" disabled>
            Application in Progress
          </Button>
        );
      case "accepted":
        return (
          <Link href={`/dashboard/messages?application=${application._id}`}>
            <Button className="w-full bg-green-500 hover:bg-green-600">
              Message Owner
            </Button>
          </Link>
        );
      case "rejected":
        return (
          <Button className="w-full" variant="destructive" disabled>
            Application Rejected
          </Button>
        );
      default:
        return (
          <Link href={`/dashboard/pets/${pet._id}/adopt`}>
            <Button className="w-full">Start Adoption Process</Button>
          </Link>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* pet images */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                {pet.images && pet.images.length > 0 && !imageError ? (
                  <Image
                    src={pet.images[selectedImageIndex]}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <PawPrint className="size-24 text-gray-300" />
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <Badge
                    variant={pet.isAvailable ? "default" : "secondary"}
                    className="bg-white/90 text-gray-900"
                  >
                    {pet.isAvailable ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>

              {/* Image thumbnails */}
              {pet.images && pet.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto p-4">
                  {pet.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`size-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 ${selectedImageIndex === index ? "border-orange-500" : "border-gray-200"} `}
                    >
                      <Image
                        src={image}
                        alt={`${pet.name} ${index + 1}`}
                        width={64}
                        height={64}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* pet details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">{pet.name}</CardTitle>
              <CardDescription className="text-lg">
                {pet.breed} &middot; {pet.type}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">
                      {pet.age} {pet.age === 1 ? "year" : "years"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Weight className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium capitalize">{pet.size}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{pet.gender}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="size-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium capitalize">{pet.location}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Characteristics */}
              <div>
                <h3 className="mb-4 font-semibold">Characteristics</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-3">
                    <div className="rounded bg-orange-100 p-2">
                      <Activity className="size-5 text-orange-500" />
                    </div>

                    <div>
                      <p className="font-medium">Activity Level</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {pet.activityLevel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded bg-blue-100 p-2">
                      <Users className="size-5 text-blue-500" />
                    </div>

                    <div>
                      <p className="font-medium">Good with Kids</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {pet.goodWithKids ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded bg-pink-100 p-2">
                      <PawPrint className="size-5 text-pink-500" />
                    </div>

                    <div>
                      <p className="font-medium">Good with Pets</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {pet.goodWithPets ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded bg-green-100 p-2">
                      <Home className="size-5 text-green-500" />
                    </div>

                    <div>
                      <p className="font-medium">House Trained</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {pet.isHouseTrained ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="mb-3 font-semibold">About {pet.name}</h3>
                <p className="leading-relaxed text-gray-700">
                  {pet.description}
                </p>
              </div>

              {/* Medical info */}
              {pet.medicalInfo && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 flex items-center font-semibold">
                      <Stethoscope className="mr-2 size-5 text-red-500" />
                      Medical Information
                    </h3>
                    <p className="leading-relazed text-gray-700">
                      {pet.medicalInfo}
                    </p>
                  </div>
                </>
              )}

              {/* Adoption fee */}
              {pet.adoptionFee && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 font-semibold">Adoption Fee</h3>
                    <p className="text-2xl font-bold text-orange-500">
                      ${pet.adoptionFee}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* CTA button */}
          <Card>
            <CardContent className="p-6">{getActionButton()}</CardContent>
          </Card>

          {/* Owner info */}
          {owner && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Pet Owner</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="size-12">
                    <AvatarImage src={owner.profileImage} />
                    <AvatarFallback>
                      <User className="size-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm">{owner.location}</p>
                  </div>
                </div>

                {owner.bio && (
                  <p className="text-sm text-gray-700">{owner.bio}</p>
                )}

                <div className="space-y-2">
                  {owner.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="size-4" />
                      <span>{owner.email}</span>
                    </div>
                  )}
                  {owner.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="size-4" />
                      <span>{owner.phone}</span>
                    </div>
                  )}
                </div>

                <Link href={`/dashboard/users/${owner._id}`}>
                  <Button variant="outline" className="w-full">
                    VIew Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Application status */}
          {application && (
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex items-center space-x-2">
                  {application.status === "pending" && (
                    <>
                      <div className="size-3 animate-pulse rounded-full bg-yellow-500"></div>
                      <span className="text-yellow-700">Pending Review</span>
                    </>
                  )}

                  {application.status === "accepted" && (
                    <>
                      <Check className="size-4 text-green-500" />
                      <span className="text-green-700">Accepted</span>
                    </>
                  )}

                  {application.status === "rejected" && (
                    <>
                      <X className="size-4 text-red-500" />
                      <span className="text-red-700">Rejected</span>
                    </>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Applied on{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
