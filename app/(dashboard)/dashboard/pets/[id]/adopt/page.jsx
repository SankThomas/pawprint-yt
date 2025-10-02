"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { ArrowLeft, PawPrint, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";

export default function AdoptPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    experience: "",
    livingSpace: "",
    workSchedule: "",
    otherPets: "",
    reason: "",
    references: "",
    additionalInfo: "",
  });

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const pet = useQuery(api.pets.getPetById, { id: id });
  const owner = useQuery(
    api.users.getUserById,
    pet?.ownerId ? { id: pet.ownerId } : "skip",
  );

  const createApplication = useMutation(api.applications.createApplication);
  const createNotification = useMutation(api.notifications.createNotification);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !pet || !owner) {
      toast.error("Missing required information");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "experience",
      "livingSpace",
      "workSchedule",
      "otherPets",
      "reason",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field].trim(),
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create application
      const applicationId = await createApplication({
        petId: pet._id,
        applicantId: currentUser._id,
        ownerId: pet.ownerId,
        applicationData: formData,
      });

      // Create notification for the owner
      await createNotification({
        userId: pet.ownerId,
        type: "adoption_request",
        title: "New Adoption Application",
        message: `${currentUser.name} want to adopt ${pet.name}`,
        relatedId: applicationId,
      });

      toast.success("Application submitted successfully!");
      router.push(`/dashboard/pets/${pet._id}`);
    } catch (error) {
      console.error("Error submitting application", error);
      toast.error("Failed to submit application. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pet || !currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/pets/${pet._id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 size-4" />
            Back to {pet.name}'s profile
          </Button>
        </Link>

        <div className="text-center">
          <PawPrint className="mx-auto mb-4 size-12 text-orange-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Adopt {pet.name}
          </h1>
          <p>Fill out this application to start the adoption process</p>
        </div>
      </div>

      {/* Pet summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex size-16 items-center justify-center rounded-lg bg-gray-100">
              <PawPrint className="size-8 text-gray-400" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">{pet.name}</h3>
              <p>
                {pet.breed} &middot; {pet.type}
              </p>
              <p className="text-sm text-gray-500">
                {pet.age} years old &middot; {pet.location}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application form */}
      <Card>
        <CardHeader>
          <CardTitle>Adoption Application</CardTitle>
          <CardDescription>
            Please provide detailed information to help us ensure the best match
            for {pet.name}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="experience">Experience with pets *</Label>
              <Select
                value={formData.experience}
                onValueChange={(value) =>
                  handleInputChange("experience", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="first-time">
                    First-time pet owner
                  </SelectItem>
                  <SelectItem value="some">Some experience</SelectItem>
                  <SelectItem value="experienced">Very experienced</SelectItem>
                  <SelectItem value="professional">
                    Professional (vet, trainer, etc)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="livingSpace">Living Space *</Label>
              <Select
                value={formData.livingSpace}
                onValueChange={(value) =>
                  handleInputChange("livingSpace", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Describe your living space" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house-no-yard">
                    House without yard
                  </SelectItem>
                  <SelectItem value="house-small-yard">
                    House with small yard
                  </SelectItem>
                  <SelectItem value="house-large-yard">
                    House with large yard
                  </SelectItem>
                  <SelectItem value="farm">Farm / Rural property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workSchedule">Work Schedule *</Label>
              <Select
                value={formData.workSchedule}
                onValueChange={(value) =>
                  handleInputChange("workSchedule", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your work schedule" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="work-from-home">Work from home</SelectItem>
                  <SelectItem value="part-time">
                    Part Time (less than 6 hours / day)
                  </SelectItem>
                  <SelectItem value="full-time">
                    Full time (6-8 hours / day)
                  </SelectItem>
                  <SelectItem value="long-hours">
                    Long hours (more than 8 hours / day)
                  </SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="otherPets">Other pets in household *</Label>
              <Select
                value={formData.otherPets}
                onValueChange={(value) => handleInputChange("otherPets", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Do you have other pets?" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">No other pets</SelectItem>
                  <SelectItem value="dogs">Dogs</SelectItem>
                  <SelectItem value="cats">Cats</SelectItem>
                  <SelectItem value="both">Both cats and dogs</SelectItem>
                  <SelectItem value="other">Other animals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">
                Why do you want to adopt {pet.name}
              </Label>
              <Textarea
                id="reason"
                placeholder="Tell us why you are interested in adopting this pet..."
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="references">References (Optional)</Label>
              <Textarea
                id="references"
                placeholder="Please provide contact information for references (veterinarian, previous pet experience, etc)"
                value={formData.references}
                onChange={(e) =>
                  handleInputChange("references", e.target.value)
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo">
                Additional Information (Optional)
              </Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional information you would like to share..."
                value={formData.additionalInfo}
                onChange={(e) =>
                  handleInputChange("additionalInfo", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`/dashboard/pets/${pet._id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Submit application
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
