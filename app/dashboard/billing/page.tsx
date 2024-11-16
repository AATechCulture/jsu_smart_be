import React from "react";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Trophy } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";

const communityStats = {
  memberCount: 1247,
  activeDiscussions: 23,
  upcomingEvents: 5,
  achievements: 156
};

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Community Hub</h1>
        <Badge variant="default">
          {/* {session.user.membershipLevel || 'Member'} */}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Active Members</p>
                <p className="text-2xl font-bold">{communityStats.memberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Active Discussions</p>
                <p className="text-2xl font-bold">{communityStats.activeDiscussions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-bold">{communityStats.upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Achievements</p>
                <p className="text-2xl font-bold">{communityStats.achievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - First 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Discussions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
              <CardDescription>
                Join the conversation with other community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">Discussion Title {index + 1}</h3>
                      <p className="text-sm text-gray-500">Started by User{index + 1} • 2h ago</p>
                    </div>
                    <Badge variant="secondary">{Math.floor(Math.random() * 20)} replies</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Don't miss out on these community events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Community Event {index + 1}</h3>
                      <p className="text-sm text-gray-500">Date • Time • Virtual</p>
                      <Badge className="mt-2" variant="outline">RSVP</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant and Recommendations - Third column */}
        <div className="space-y-6">
          <AIChatBox />
          
          {/* AI-Powered Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Personalized suggestions based on your interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Badge className="mb-2" variant="secondary">Discussion</Badge>
                  <h3 className="font-semibold">JavaScript Best Practices</h3>
                  <p className="text-sm text-gray-500">Based on your recent activity</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Badge className="mb-2" variant="secondary">Event</Badge>
                  <h3 className="font-semibold">Web Development Workshop</h3>
                  <p className="text-sm text-gray-500">Matches your interests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}