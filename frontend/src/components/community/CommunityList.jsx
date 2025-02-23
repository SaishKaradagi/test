// src/components/community/CommunityList.jsx
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import CommunityCard from "./CommunityCard";
import { Search } from "lucide-react";

const CommunityList = ({ communities, onSelectCommunity }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || community.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4 p-1">
          {filteredCommunities.map((community) => (
            <CommunityCard
              key={community._id}
              community={community}
              onClick={() => onSelectCommunity(community)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
