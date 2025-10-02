"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser, useClerk } from "@clerk/nextjs";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  User,
  Bell,
  Save,
  Trash2,
  AlertTriangle,
  PawPrint,
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    phone: "",
  });
  const [preferences, setPreferences] = useState({
    petType: [],
    size: [],
    age: [],
    activityLevel: "",
    livingSpace: "",
    experience: "",
  });

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const updateUser = useMutation(api.users.updateUser);
  const deleteUser = useMutation(api.users.deleteUser);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        phone: currentUser.phone || "",
      });

      if (currentUser.preferences) {
        setPreferences({
          petType: currentUser.preferences.petType || [],
          size: currentUser.preferences.size || [],
          age: currentUser.preferences.age || [],
          activityLevel: currentUser.preferences.activityLevel || "",
          livingSpace: currentUser.preferences.livingSpace || "",
          experience: currentUser.preferences.experience || "",
        });
      }
    }
  }, [currentUser]);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrefenceChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayPreferenceChange = (field, value, checked) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await updateUser({
        id: currentUser._id,
        ...profileData,
        preferences,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings", error);
      toast.error("Failed to save settings. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    setIsDeleting(true);
    try {
      await deleteUser({ id: currentUser._id });
      toast.success("Account deleted successfully");
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account", error);
      toast.error("Failed to delete account. Please try again later");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          Settings
        </h1>
        <p>Manage your profile and preferences</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Profile settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 size-5" />
              Profile information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) =>
                  handleProfileChange("location", e.target.value)
                }
                placeholder="Enter your city or area"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pet preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PawPrint className="mr-2 size-5" />
              Pet Preferences
            </CardTitle>
            <CardDescription>
              Set your preferences to get better pet recommendations
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Pet types */}
            <div>
              <Label className="text-base font-medium">
                Preferred pet types
              </Label>
              <p className="mb-3 text-sm">Select all that apply</p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {["dog", "cat", "bird", "rabbit", "other"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={preferences.petType.includes(type)}
                      onCheckedChange={(checked) =>
                        handleArrayPreferenceChange("petType", type, checked)
                      }
                    />
                    <Label htmlFor={type} className="capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pet sizes */}
            <div>
              <Label className="text-base font-medium">
                Preferred pet sizes
              </Label>
              <p className="mb-3 text-sm">Select all that apply</p>

              <div className="grid grid-cols-3 gap-3">
                {["small", "medium", "large"].map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={size}
                      checked={preferences.size.includes(size)}
                      onCheckedChange={(checked) =>
                        handleArrayPreferenceChange("size", size, checked)
                      }
                    />
                    <Label htmlFor={size} className="capitalize">
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">
                Preferred age range
              </Label>
              <p className="mb-3 text-sm">Select all that apply</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { value: "young", label: "Young (0-2 years)" },
                  { value: "adult", label: "Adult (3-7 years)" },
                  { value: "senior", label: "Senior (8+ years)" },
                ].map((age) => (
                  <div key={age.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={age.value}
                      checked={preferences.age.includes(age.value)}
                      onCheckedChange={(checked) =>
                        handleArrayPreferenceChange("age", age.value, checked)
                      }
                    />
                    <Label htmlFor={age.value} className="capitalize">
                      {age.value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Activity Level */}
              <div>
                <Label htmlFor="activityLevel">Preferred activity level</Label>
                <Select
                  value={preferences.activityLevel}
                  onValueChange={(value) =>
                    handlePrefenceChange("activityLevel", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    <SelectItem value="low">
                      Low - Calm, relaxed pets
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Moderately active pets
                    </SelectItem>
                    <SelectItem value="high">
                      High - Very active, energetic pets
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Living space */}
              <div>
                <Label htmlFor="livingSpace">Your living space</Label>
                <Select
                  value={preferences.livingSpace}
                  onValueChange={(value) =>
                    handlePrefenceChange("livingSpace", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your living space" />
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
            </div>

            {/* Experience */}
            <div>
              <Label htmlFor="experience">Your experience with pets</Label>
              <Select
                value={preferences.experience}
                onValueChange={(value) =>
                  handlePrefenceChange("experience", value)
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
                    Professional (vet, trainer, etc.)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 size-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h2 className="mb-2 font-medium text-red-800">Delete account</h2>
              <p className="mb-4 text-sm text-red-700">
                This action cannot be undone. This will permanently delete your
                account, all your pets, applications, messages, and remove all
                associated data.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="mr-2 size-4" />
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      you account and remove all your data from our servers,
                      including:
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Your profile and personal information</li>
                        <li>All pets you have listed for adoption</li>
                        <li>All adoption applications (sent and received)</li>
                        <li>All messages and conversations</li>
                        <li>All notifications and preferences</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
