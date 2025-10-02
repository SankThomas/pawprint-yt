"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import PetCard from "@/components/pet-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/loading-spinner";

export default function DiscoverPage() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    breed: "",
    size: "",
    age: "",
    gender: "",
    activityLevel: "",
    goodWithKids: "",
    goodWithPets: "",
    location: "",
  });

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const allPets = useQuery(api.pets.getAllPets);
  const filteredPets = useQuery(api.pets.getFilteredPets, {
    searchTerm,
    filters,
  });
  const pets = filteredPets || allPets || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      breed: "",
      size: "",
      age: "",
      gender: "",
      activityLevel: "",
      goodWithKids: "",
      goodWithPets: "",
      location: "",
    });
    setSearchTerm("");
  };

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Discover pets</h1>
        <p>Find your perfect companion from all available pets</p>
      </div>

      {/* Search and filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="size-5" />
              <span>Search and filter</span>

              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} active</Badge>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 size-4" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search bar */}

          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 !-translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search by name, breed, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter grid */}
          <div className="grid-cola-1 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Pet type
              </Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Size
              </Label>
              <Select
                value={filters.size}
                onValueChange={(value) => handleFilterChange("size", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All sizes</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Age
              </Label>
              <Select
                value={filters.age}
                onValueChange={(value) => handleFilterChange("age", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All ages</SelectItem>
                  <SelectItem value="young">Young (0-2 years)</SelectItem>
                  <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                  <SelectItem value="senior">Senior (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Gender
              </Label>
              <Select
                value={filters.gender}
                onValueChange={(value) => handleFilterChange("gender", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Activity Level
              </Label>
              <Select
                value={filters.activityLevel}
                onValueChange={(value) =>
                  handleFilterChange("activityLevel", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Good with kids
              </Label>
              <Select
                value={filters.goodWithKids}
                onValueChange={(value) =>
                  handleFilterChange("goodWithKids", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Good with pets
              </Label>
              <Select
                value={filters.goodWithPets}
                onValueChange={(value) =>
                  handleFilterChange("goodWithPets", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </Label>
              <Input
                placeholder="Enter city or area"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {pets.length} {pets.length === 1 ? "pet" : "pets"} found
          </h2>
        </div>

        {pets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
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
              <Search className="mx-auto mb-4 size-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No pets found
              </h3>
              <p className="mb-4">
                Try adjusting your search criteria or filters to find more pets.
              </p>

              <Button onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
