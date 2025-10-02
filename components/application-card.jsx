import React from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Calendar, Eye, MessageCircle, User } from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";

export default function ApplicationCard({
  application,
  type,
  getStatusIcon,
  getStatusColor,
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold">
                  {type === "sent"
                    ? "Your application"
                    : "Application received"}
                </h3>
                <p className="text-sm">
                  {type === "sent"
                    ? "Pet adoption application"
                    : "Someone wants to adopt your pet"}
                </p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <span>
                  {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(application.status)}
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
            </div>

            <p className="mb-4 text-sm text-gray-700">
              <strong>Reason:</strong>
              {application.applicationData.reason.substring(0, 100)}
              {application.applicationData.reason.length > 100 && "..."}
            </p>
          </div>

          <div className="flex flex-row gap-2">
            <Link href={`/dashboard/applications/${application._id}`}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Eye className="mr-2 size-4" />
                View details
              </Button>
            </Link>

            {application.status === "accepted" && (
              <Link href={`/dashboard/messages?application=${application._id}`}>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 size-4" />
                  Message
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
