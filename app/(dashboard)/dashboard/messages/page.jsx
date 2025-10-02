"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User, Download } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";

export default function MessagesPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("application");
  const [selectedApplication, setSelectedApplication] = useState(applicationId);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  const applications = useQuery(
    api.applications.getApplicationsByApplicant,
    currentUser?._id ? { applicantId: currentUser._id } : "skip",
  );
  const ownerApplications = useQuery(
    api.applications.getApplicationsByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip",
  );
  const messages = useQuery(
    api.messages.getMessagesByApplication,
    selectedApplication ? { applicationId: selectedApplication } : "skip",
  );
  const sendMessage = useMutation(api.messages.sendMessage);

  const allApplications = [
    ...(applications || []).filter((app) => app.status === "accepted"),
    ...(ownerApplications || []).filter((app) => app.status === "accepted"),
  ];

  useEffect(() => {
    if (applicationId && !selectedApplication) {
      setSelectedApplication(applicationId);
    }
  }, [applicationId, selectedApplication]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedApplication || !currentUser)
      ReceiptRussianRuble;

    const application = allApplications.find(
      (app) => app._id === selectedApplication,
    );

    if (!application) return;

    const receiverId =
      application.applicantId === currentUser._id
        ? application.ownerId
        : application.applicantId;

    setIsLoading(true);

    try {
      await sendMessage({
        applicationId: selectedApplication,
        senderId: currentUser._id,
        receiverId,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Messages</h1>
        <p>Communicate with other users about adoptions</p>
      </div>

      <div className="h-[calc(100vh - 20rem)] grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 size-5" />
              Conversations
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {allApplications.length > 0 ? (
                allApplications.map((application) => (
                  <button
                    key={application._id}
                    onClick={() => setSelectedApplication(application._id)}
                    className={`w-full border-b p-4 text-left transition-colors hover:bg-gray-50 ${selectedApplication === application._id && "border-orange-200 bg-orange-50"}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="size-8">
                        <AvatarFallback>
                          <User className="size-4" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {application?.ownerId?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {application.applicantId === currentUser._id
                            ? "Your application"
                            : "Application received"}
                        </p>
                      </div>

                      <Badge variant="secondary" className="text-xs">
                        {application.status}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p4 text-center text-gray-500">
                  <MessageCircle className="mx-auto mb-2 size-8 text-gray-400" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2">
          {selectedApplication ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Adoption discussion</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 size-4" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex h-full flex-col p-0">
                {/* Messages list */}
                <div className="max-h-96 flex-1 space-y-4 overflow-y-auto p-4">
                  {messages && messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.senderId === currentUser._id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${message.senderId === currentUser._id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"}`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`mt-1 text-xs ${message.senderId === currentUser._id ? "text-orange-100" : "text-gray-500"}`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <MessageCircle className="mx-auto mb-2 size-8 text-gray-400" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !newMessage.trim()}
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="mx-auto mb-4 size-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">
                  Select a conversation
                </h3>
                <p>Choose a conversation from the left to start messaging.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
