import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, Hash, Plus } from "lucide-react";

const CommunityHub = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        {/* Communities Sidebar */}
        <Card className="col-span-3 h-full">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between">
              <span>Communities</span>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2">
                {communities.map((community) => (
                  <Button
                    key={community._id}
                    variant={
                      selectedCommunity?._id === community._id
                        ? "default"
                        : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCommunity(community)}
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    {community.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="col-span-6 h-full">
          <CardHeader>
            <CardTitle>
              {selectedCommunity
                ? selectedCommunity.name
                : "Select a Community"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedCommunity ? (
              <CommunityChat communityId={selectedCommunity._id} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a community to start chatting
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Sidebar */}
        <Card className="col-span-3 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserList communityId={selectedCommunity?._id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHub;
