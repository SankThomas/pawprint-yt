"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadButton } from "@uploadthing/react";
import { PawPrint, Save, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "@/components/loading-spinner";
import { toast } from "sonner";

export default function AddPetPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [petData, setPetData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    size: "",
    gender: "",
    description: "",
    images: [],
    activityLevel: "",
    goodWithKids: false,
    goodWithPets: false,
    isHouseTrained: false,
    medicalInfo: "",
    adoptionFee: "",
    location: "",
  });

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const createPet = useMutation(api.pets.createPet);

  const handleInputChange = (field, value) => {
    setPetData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setPetData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "type",
      "breed",
      "age",
      "size",
      "gender",
      "description",
      "activityLevel",
      "location",
    ];
    const missingFields = requiredFields.filter((field) => !petData[field]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all the required fields");
      return;
    }

    if (petData.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPet({
        ownerId: currentUser._id,
        name: petData.name,
        type: petData.type,
        breed: petData.breed,
        age: parseInt(petData.age),
        size: petData.size,
        gender: petData.gender,
        description: petData.description,
        images: petData.images,
        activityLevel: petData.activityLevel,
        goodWithKids: petData.goodWithKids,
        goodWithPets: petData.goodWithPets,
        isHouseTrained: petData.isHouseTrained,
        medicalInfo: petData.medicalInfo,
        adoptionFee: petData.adoptionFee
          ? parseFloat(petData.adoptionFee)
          : undefined,
        location: petData.location,
      });

      toast.success("Pet added successfully");
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("Error creating pet", error);
      toast.error("Failed to add pet. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 size-4" />
            Back to profile
          </Button>
        </Link>

        <div className="text-center">
          <PawPrint className="mx-auto mb-4 size-12 text-orange-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Add a Pet</h1>
          <p>Help a pet find their forever home</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
          <CardDescription>
            Provide detailed information about the pet to help potential
            adopters
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Pet Name *</Label>
                <Input
                  id="name"
                  value={petData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter pet's name"
                />
              </div>

              <div>
                <Label htmlFor="type">Pet Type *</Label>
                <Select
                  value={petData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="breed">Breed *</Label>
                <Input
                  id="breed"
                  value={petData.breed}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  placeholder="Enter breed"
                />
              </div>

              <div>
                <Label htmlFor="age">Age (years) *</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="30"
                  value={petData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Age in years"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={petData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="size">Size *</Label>
                <Select
                  value={petData.size}
                  onValueChange={(value) => handleInputChange("size", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activityLevel">Activity Level *</Label>
                <Select
                  value={petData.activityLevel}
                  onValueChange={(value) =>
                    handleInputChange("activityLevel", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={petData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter city or area"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={petData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the pet's personalilty, habits and any special needs..."
                rows={4}
              />
            </div>

            {/* Images */}
            <div>
              <Label>Pet images *</Label>
              <div className="mt-2">
                <UploadButton
                  endpoint="petImages"
                  onClientUploadComplete={(res) => {
                    const urls = res.map((file) => file.ufsUrl);
                    setPetData((prev) => ({
                      ...prev,
                      images: [...prev.images, ...urls],
                    }));
                    toast.success("Images uploaded successfully");
                  }}
                  onUploadError={(error) => {
                    toast.error("Upload failed:", {
                      description: error.message,
                    });
                  }}
                />

                {petData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {petData.images.map((url, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={url}
                          alt={`Pet image ${index + 1}`}
                          width={200}
                          height={200}
                          className="h-40 w-64 rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPetData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }));
                          }}
                        >
                          <X className="size-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <Label className="text-base font-medium">Characteristics</Label>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="goodWithKids"
                    checked={petData.goodWithKids}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("goodWithKids", checked)
                    }
                  />
                  <Label htmlFor="goodWithKids">Good with Kids</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="goodWithPets"
                    checked={petData.goodWithPets}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("goodWithPets", checked)
                    }
                  />
                  <Label htmlFor="goodWithPets">Good with other pets</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHouseTrained"
                    checked={petData.isHouseTrained}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("isHouseTrained", checked)
                    }
                  />
                  <Label htmlFor="isHouseTrained">House Trained</Label>
                </div>
              </div>
            </div>

            {/* Optional information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="adoptionFee">Adoption Fee (optional)</Label>
                <Input
                  id="adoptionFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={petData.adoptionFee}
                  onChange={(e) =>
                    handleInputChange("adoptionFee", e.target.value)
                  }
                  placeholder="Enter adoption fee"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalInfo">
                Medical information (Optional)
              </Label>
              <Textarea
                id="medicalInfo"
                value={petData.medicalInfo}
                onChange={(e) =>
                  handleInputChange("medicalInfo", e.target.value)
                }
                placeholder="Any medical conditions, vaccinations, or special care requirements..."
                rows={3}
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/profile">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Adding pet...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Add pet
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
