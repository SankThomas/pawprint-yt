"use client";

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
import { Badge } from "@/components/ui/badge";
import { Bell, PawPrint, MessageCircle, Check, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";

export default function NotificationsPage() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );
  const notifications = useQuery(
    api.notifications.getNotificationsByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );
  const markAsRead = useMutation(api.notifications.markAsRead);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ id: notificationId });
      toast.success("Notification read");
    } catch (error) {
      console.error("Error marking notification as read", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "adoption_request":
        return <PawPrint className="size-5 text-orange-500" />;
      case "application_update":
        return <Check className="size-5 text-green-500" />;
      case "message":
        return <MessageCircle className="size-5 text-blue-500" />;
      default:
        return <Bell className="size-5 text-gray-500" />;
    }
  };

  const getNotificationAction = (notification) => {
    switch (notification.type) {
      case "adoption_request":
        return (
          <Link href={`/dashboard/applications/${notification.relatedId}`}>
            <Button size="sm" variant="outline">
              View application
            </Button>
          </Link>
        );
      case "application_update":
        return (
          <Link href={`/dashboard/applications`}>
            <Button size="sm" variant="outline">
              View application
            </Button>
          </Link>
        );
      case "message":
        return (
          <Link
            href={`/dashboard/messages?application=${notification.relatedId}`}
          >
            <Button size="sm" variant="outline">
              View message
            </Button>
          </Link>
        );
      default:
        return null;
    }
  };

  if (!currentUser) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Notifications</h1>
        <p>Stay updated on your adoption applications and messages</p>
      </div>

      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-all duration-200 ${!notification.isRead ? "border-orange-200 bg-orange-50" : "hover:shadow-sm"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge variant="default" className="bg-orange-500">
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="mb-2 text-gray-700">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            notification.createdAt,
                          ).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        {getNotificationAction(notification)}
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <CardContent>
              <Bell className="mx-auto mb-4 size-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No notifications yet
              </h3>
              <p className="mb-4">
                You will receive notifications when someone applies to adopt
                your pets or when there are updates on your applications.
              </p>

              <Link href="/dashboard/discover">
                <Button>Discover pets</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
